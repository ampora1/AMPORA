import os
import googlemaps
from dotenv import load_dotenv
from datetime import datetime, timedelta
from typing import Any, Dict, List, Tuple, Optional

import psycopg2
import psycopg2.extras

load_dotenv()

# -------------------- Google Maps --------------------
GMAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY") or os.getenv("GMAPS_API_KEY")
if not GMAPS_API_KEY:
    raise RuntimeError("GOOGLE_MAPS_API_KEY / GMAPS_API_KEY missing in .env")

gmaps_client = googlemaps.Client(key=GMAPS_API_KEY)

# -------------------- DB --------------------
def _get_conn():
    """
    Use ONE of:
      - DATABASE_URL=postgresql://user:pass@host:port/dbname
    OR
      - DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
    """
    db_url = os.getenv("DATABASE_URL")
    if db_url:
        return psycopg2.connect(db_url)

    host = os.getenv("DB_HOST", "localhost")
    port = int(os.getenv("DB_PORT", "5432"))
    name = os.getenv("DB_NAME")
    user = os.getenv("DB_USER")
    pwd = os.getenv("DB_PASSWORD")

    if not all([name, user, pwd]):
        raise RuntimeError("DB config missing. Set DATABASE_URL or DB_NAME/DB_USER/DB_PASSWORD")

    return psycopg2.connect(host=host, port=port, dbname=name, user=user, password=pwd)

def _resolve_station_ids_if_missing(stations_list: List[Dict[str, Any]]) -> None:
    """
    If station_id is missing, try to resolve using lat/lng.
    Updates stations_list in-place.
    """
    missing = [s for s in stations_list if not s.get("station_id")]
    if not missing:
        return

    conn = _get_conn()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            for s in missing:
                lat = s.get("lat") or s.get("latitude")
                lng = s.get("lng") or s.get("longitude")
                if lat is None or lng is None:
                    continue

                cur.execute(
                    """
                    SELECT station_id
                    FROM station
                    WHERE ABS(latitude - %s) < 0.002
                      AND ABS(longitude - %s) < 0.002
                    ORDER BY ABS(latitude - %s) + ABS(longitude - %s)
                    LIMIT 1
                    """,
                    (lat, lng, lat, lng),
                )
                row = cur.fetchone()
                if row and row.get("station_id"):
                    s["station_id"] = row["station_id"]
    finally:
        conn.close()



def _fetch_chargers_and_bookings_for_stations(
    station_ids: List[str],
    horizon_hours: int = 24
) -> Dict[str, List[Dict[str, Any]]]:
    """
    Returns:
      station_id -> [
        { "charger_id": "...", "bookings": [ {"start_time": dt, "end_time": dt}, ... ] }
      ]
    """

    if not station_ids:
        return {}

    now = datetime.now()
    horizon_end = now + timedelta(hours=horizon_hours)

    conn = _get_conn()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:

            # 1) chargers for given stations
            cur.execute(
                """
                SELECT charger_id, station_id
                FROM charger
                WHERE station_id = ANY(%s)
                """,
                (station_ids,),
            )
            chargers = cur.fetchall()

            station_to_chargers: Dict[str, List[Dict[str, Any]]] = {sid: [] for sid in station_ids}
            if not chargers:
                return station_to_chargers  # no chargers for these stations

            charger_ids = [c["charger_id"] for c in chargers]

            # prepare charger objects + map charger_id -> object
            charger_obj_by_id: Dict[str, Dict[str, Any]] = {}
            for c in chargers:
                cid = c["charger_id"]
                sid = c["station_id"]
                obj = {"charger_id": cid, "bookings": []}
                charger_obj_by_id[cid] = obj
                station_to_chargers.setdefault(sid, []).append(obj)

            # 2) bookings for these chargers (only in horizon window)
            cur.execute(
                """
                SELECT charger_id, start_time, end_time, booking_status
                FROM booking
                WHERE charger_id = ANY(%s)
                  AND end_time > %s
                  AND start_time < %s
                  AND (booking_status IS NULL OR booking_status NOT IN ('CANCELLED', 'REJECTED'))
                """,
                (charger_ids, now, horizon_end),
            )
            bookings = cur.fetchall()

            for b in bookings:
                cid = b["charger_id"]
                if cid in charger_obj_by_id:
                    charger_obj_by_id[cid]["bookings"].append({
                        "start_time": b["start_time"],
                        "end_time": b["end_time"],
                    })

            return station_to_chargers

    finally:
        try:
            conn.close()
        except Exception:
            pass


# -------------------- MAIN LOGIC --------------------
def analyze_stations_logic(origin, stations_list, horizon_hours: int = 24):
    """
    UPDATED VERSION:
      - If stations_list doesn't contain chargers/bookings, we fetch them from DB
      - Tables used:
          station(station_id, latitude, longitude, name, address, status, operator_id)
          charger(charger_id, station_id, ...)
          booking(booking_id, charger_id, start_time, end_time, booking_status, ...)
    """

    if not stations_list:
        return None, []

    now = datetime.now()
    horizon_end = now + timedelta(hours=horizon_hours)

    # ----------- Normalize station fields (lat/lng) -----------
    # Accept both lat/lng OR latitude/longitude
    normalized: List[Dict[str, Any]] = []
    for s in stations_list:
        lat = s.get("lat", s.get("latitude"))
        lng = s.get("lng", s.get("longitude"))
        if lat is None or lng is None:
            continue

        normalized.append({
            "station_id": s.get("station_id"),
            "name": s.get("name"),
            "address": s.get("address"),
            "status": s.get("status"),
            "lat": float(lat),
            "lng": float(lng),
            # might be missing right now
            "chargers": s.get("chargers"),
        })

    if not normalized:
        return None, []

    # ----------- If chargers missing -> fetch from DB -----------
    # If ANY station has no chargers key or chargers is None, we will attach from DB.
    need_db = any(st.get("chargers") is None for st in normalized)

    if need_db:
        station_ids = [st["station_id"] for st in normalized if st.get("station_id")]
        station_to_chargers = _fetch_chargers_and_bookings_for_stations(
            station_ids=station_ids,
            horizon_hours=horizon_hours
        )
        for st in normalized:
            sid = st.get("station_id")
            st["chargers"] = station_to_chargers.get(sid, []) if sid else []

    # ---------- Distance Matrix ----------
    destinations = [(st["lat"], st["lng"]) for st in normalized]

    matrix = gmaps_client.distance_matrix(
        origins=[origin],
        destinations=destinations,
        mode="driving",
    )

    rows = matrix.get("rows") or []
    if not rows:
        return None, []

    elements = rows[0].get("elements") or []

    # ---------- Helper functions ----------
    def parse_dt(x):
        if isinstance(x, datetime):
            return x
        s = str(x).strip()
        if s.endswith("Z"):
            s = s[:-1] + "+00:00"
        s = s.replace(" ", "T") if " " in s and "T" not in s else s
        return datetime.fromisoformat(s)

    def merge_intervals(intervals: List[Tuple[datetime, datetime]]):
        if not intervals:
            return []
        intervals.sort(key=lambda x: x[0])
        merged = [list(intervals[0])]
        for st, en in intervals[1:]:
            last_st, last_en = merged[-1]
            if st <= last_en:
                merged[-1][1] = max(last_en, en)
            else:
                merged.append([st, en])
        return [(a, b) for a, b in merged]

    def future_intervals(intervals):
        cleaned = []
        for st, en in intervals:
            if en <= now:
                continue
            st2 = max(st, now)
            en2 = min(en, horizon_end)
            if en2 > st2:
                cleaned.append((st2, en2))
        return merge_intervals(cleaned)

    def arrival_inside(intervals, arrival):
        return any(st <= arrival < en for st, en in intervals)

    def next_start(intervals, arrival):
        for st, _ in intervals:
            if st > arrival:
                return st
        return None

    def earliest_release(intervals, arrival):
        ends = [en for st, en in intervals if st <= arrival < en]
        return min(ends) if ends else None

    # ---------- Build CHARGER candidates ----------
    candidates: List[Dict[str, Any]] = []

    for idx, st in enumerate(normalized):
        if idx >= len(elements):
            continue

        el = elements[idx]
        if el.get("status") != "OK":
            continue

        duration_sec = el["duration"]["value"]
        distance_m = el["distance"]["value"]
        arrival_time = now + timedelta(seconds=duration_sec)

        chargers = st.get("chargers") or []

        # ---- No chargers -> virtual free charger ----
        if not chargers:
            free_gap = max(0.0, (horizon_end - arrival_time).total_seconds() / 3600)
            candidates.append({
                "station_id": st.get("station_id"),
                "station_name": st.get("name"),
                "station_lat": st["lat"],
                "station_lng": st["lng"],
                "address": st.get("address"),
                "status": st.get("status"),

                "charger_id": None,
                "arrival_time": arrival_time.strftime("%H:%M"),
                "free_gap_hours": round(free_gap, 2),
                "fully_booked_at_arrival": False,
                "wait_hours": 0.0,
                "booked_blocks_24h": [],

                "travel_time": el["duration"]["text"],
                "distance": el["distance"]["text"],

                "_fully": 0,
                "_gap": free_gap,
                "_wait": 0.0,
                "_dur": duration_sec,
                "_dist": distance_m,
            })
            continue

        # ---- Real chargers ----
        for ch in chargers:
            cid = ch.get("charger_id")
            bookings = ch.get("bookings") or []

            intervals = []
            for b in bookings:
                intervals.append((parse_dt(b["start_time"]), parse_dt(b["end_time"])))

            intervals = future_intervals(intervals)
            blocks_24h = [{"start": stt.strftime("%H:%M"), "end": enn.strftime("%H:%M")} for stt, enn in intervals]

            if arrival_inside(intervals, arrival_time):
                fully = True
                rel = earliest_release(intervals, arrival_time)
                wait_h = max(0.0, (rel - arrival_time).total_seconds() / 3600) if rel else horizon_hours
                gap_h = 0.0
            else:
                fully = False
                nxt = next_start(intervals, arrival_time)
                if nxt:
                    gap_h = max(0.0, (nxt - arrival_time).total_seconds() / 3600)
                else:
                    gap_h = max(0.0, (horizon_end - arrival_time).total_seconds() / 3600)
                wait_h = 0.0

            candidates.append({
                "station_id": st.get("station_id"),
                "station_name": st.get("name"),
                "station_lat": st["lat"],
                "station_lng": st["lng"],
                "address": st.get("address"),
                "status": st.get("status"),

                "charger_id": cid,
                "arrival_time": arrival_time.strftime("%H:%M"),
                "free_gap_hours": round(gap_h, 2),
                "fully_booked_at_arrival": fully,
                "wait_hours": round(wait_h, 2),
                "booked_blocks_24h": blocks_24h,

                "travel_time": el["duration"]["text"],
                "distance": el["distance"]["text"],

                "_fully": 1 if fully else 0,
                "_gap": gap_h,
                "_wait": wait_h,
                "_dur": duration_sec,
                "_dist": distance_m,
            })

    if not candidates:
        return None, []

    # ---------- GLOBAL SORT (BEST CHARGER FIRST) ----------
    candidates.sort(key=lambda x: (
        x["_fully"],        # not fully booked first
        -x["_gap"],         # bigger free gap
        x["_wait"],         # smaller wait if booked
        x["_dur"],          # shorter drive
        x["_dist"],         # shorter distance
    ))

    best = candidates[0]

    best_station = {
        "name": best["station_name"],
        "lat": best["station_lat"],
        "lng": best["station_lng"],
        "address": best["address"],
        "status": best["status"],

        "travel_time": best["travel_time"],
        "distance": best["distance"],
        "wait": best["wait_hours"],

        "station_id": best["station_id"],
        "charger_id": best["charger_id"],
        "arrival_time": best["arrival_time"],
        "free_gap_hours": best["free_gap_hours"],
        "fully_booked_at_arrival": best["fully_booked_at_arrival"],
        "wait_hours": best["wait_hours"],
        "booked_blocks_24h": best["booked_blocks_24h"],
    }

    # cleanup helpers
    for c in candidates:
        c.pop("_fully", None)
        c.pop("_gap", None)
        c.pop("_wait", None)
        c.pop("_dur", None)
        c.pop("_dist", None)

    return best_station, candidates
