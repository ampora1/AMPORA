import os
import json
import random
import traceback
import base64
from datetime import datetime
from typing import Optional, List, Dict, Any

import edge_tts
import pandas as pd
import requests
from dotenv import load_dotenv

# ==========================
# 0) Feature transformer (UNCHANGED)
# ==========================
def transform_features(X_df: pd.DataFrame) -> pd.DataFrame:
    X_copy = X_df.copy()

    time_split = X_copy["time"].str.split(":", expand=True).astype(int)
    X_copy["total_minutes"] = (time_split[0] * 60) + time_split[1]

    user_mapping = {
        "Office_Worker": 0,
        "Tourist": 1,
        "Delivery_Driver": 2,
        "Casual_User": 3,
    }
    day_mapping = {
        "Monday": 0,
        "Tuesday": 1,
        "Wednesday": 2,
        "Thursday": 3,
        "Friday": 4,
        "Saturday": 5,
        "Sunday": 6,
    }
    month_mapping = {
        "January": 0, "February": 1, "March": 2, "April": 3,
        "May": 4, "June": 5, "July": 6, "August": 7,
        "September": 8, "October": 9, "November": 10, "December": 11,
    }

    X_copy["user_type_code"] = X_copy["user_type"].map(user_mapping)
    X_copy["day_code"] = X_copy["day"].map(day_mapping)
    X_copy["month_code"] = X_copy["month"].map(month_mapping)

    return X_copy.drop(["time", "day", "month", "user_type"], axis=1)


# ✅ Bind into __main__ so pickle can resolve __main__.transform_features
import __main__  # noqa
__main__.transform_features = transform_features

# ✅ Load env
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from groq import Groq
from psycopg2.extras import RealDictCursor

from database import get_db_connection
from distance_time import analyze_stations_logic
from ml_predictor import load_model, predict_activities

# ==========================
# 1) LangChain imports
# ==========================
from langchain_groq import ChatGroq
from langchain_core.tools import tool
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import SystemMessage
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain.agents.agent import AgentExecutor
from langchain.agents.tool_calling_agent.base import create_tool_calling_agent


# ==========================
# Logging helpers (CLEAR SOURCES)
# ==========================
def log(tag: str, msg: str):
    ts = datetime.now().strftime("%H:%M:%S")
    print(f"[{ts}] {tag} {msg}", flush=True)


def log_json(tag: str, title: str, obj: Any, max_len: int = 1200):
    try:
        s = json.dumps(obj, ensure_ascii=False)
    except Exception:
        s = str(obj)
    if len(s) > max_len:
        s = s[:max_len] + " ... (truncated)"
    log(tag, f"{title}: {s}")


# ==========================
# 2) Load ML model
# ==========================
try:
    load_model()
    log("[SRC:ML]", "✅ ML model loaded")
except Exception as e:
    log("[SRC:ML]", f"⚠️ ML model load failed: {e}")

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY", ""))

lc_llm = ChatGroq(
    groq_api_key=os.getenv("GROQ_API_KEY", ""),
    model="llama-3.1-8b-instant",
    temperature=0.2,
)

# ✅ Support both variable names
GMAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY") or os.getenv("GMAPS_API_KEY") or ""
if not GMAPS_API_KEY:
    log("[SRC:PLACES]", "⚠️ GOOGLE_MAPS_API_KEY/GMAPS_API_KEY missing -> Google Places disabled")

app = FastAPI()

# ✅ Vite CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================
# 3) Memory store per conversation_id
# ==========================
CHAT_STORE: Dict[str, Dict[str, Any]] = {}

APP_USER_TYPES = ["Delivery_Driver", "Business_Man", "Casual_Driver", "Tourist"]


# ==========================
# 4) Pydantic Models (MINIMAL change: add station_id)
# ==========================
class Station(BaseModel):
    # ✅ frontend might send station_id; if not, we try to resolve by lat/lng/name
    station_id: Optional[str] = None
    name: str
    lat: float
    lng: float
    address: Optional[str] = None
    status: Optional[str] = None


class NearbyStationsRequest(BaseModel):
    path_points: List[dict]
    buffer_km: float = 5.0


class ChatRequest(BaseModel):
    conversation_id: str = Field(..., description="Trip/chat id")
    start_city: str
    end_city: str
    start_lat: Optional[float] = None
    start_lng: Optional[float] = None
    soc_level: int = 50
    user_text: str
    stations: List[Station] = []
    route_points: List[dict] = []


class ChatResponse(BaseModel):
    conversation_id: str
    assistant_text: str
    user_type: str
    best_station: Optional[dict] = None
    sorted_stations: List[dict] = []
    audio_base64: Optional[str] = None


# ==========================
# 5) Intent + Helpers
# ==========================
def get_origin(req: ChatRequest):
    if req.start_lat is not None and req.start_lng is not None:
        return (req.start_lat, req.start_lng)
    return req.start_city


def should_reinfer_user_type(user_text: str) -> bool:
    t = (user_text or "").lower()
    triggers = [
        "travel", "trip", "tour", "tourist", "holiday", "vacation",
        "deliver", "delivery", "drop", "package",
        "meeting", "business", "office", "work"
    ]
    return any(k in t for k in triggers)


def infer_user_type_llm(user_text: str, recent_messages: List[dict], start_city: str, end_city: str) -> str:
    history_text = "\n".join([f"{m['role']}: {m['text']}" for m in recent_messages[-8:]])

    prompt_txt = f"""
Classify the user into exactly ONE type:
- Delivery_Driver
- Business_Man
- Casual_Driver
- Tourist

Trip: {start_city} -> {end_city}

Conversation:
{history_text}

User message:
{user_text}

Return ONLY JSON:
{{"user_type":"Casual_Driver"}}
"""
    try:
        res = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt_txt}],
            model="llama-3.1-8b-instant",
            response_format={"type": "json_object"},
        )
        data = json.loads(res.choices[0].message.content)
        ut = data.get("user_type", "Casual_Driver")
        return ut if ut in APP_USER_TYPES else "Casual_Driver"
    except Exception:
        return "Casual_Driver"


def is_greeting(text: str) -> bool:
    t = (text or "").strip().lower()
    return t in ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"]


def wants_best_station(text: str) -> bool:
    t = (text or "").lower()
    keys = ["best station", "recommended station", "which station", "what is the best station"]
    return any(k in t for k in keys)


def wants_travel_time(text: str) -> bool:
    t = (text or "").lower()
    keys = ["travel time", "travelling time", "how long", "duration", "drive time"]
    return any(k in t for k in keys)


def is_why_question(text: str) -> bool:
    t = (text or "").lower()
    return any(k in t for k in ["why", "reason", "choose", "selected", "picked"])


def wants_places(text: str) -> bool:
    t = (text or "").lower()
    keys = ["beautiful", "places", "shops", "shop", "supermarket", "restaurant", "cafe", "nearby", "attractions", "scenic"]
    return any(k in t for k in keys)


def format_station_reason(best: dict) -> str:
    parts = []
    if best.get("charger_id"):
        parts.append(f"charger {best.get('charger_id')}")
    if best.get("arrival_time"):
        parts.append(f"arrival ~{best.get('arrival_time')}")
    if best.get("free_gap_hours") is not None:
        parts.append(f"free window ~{best.get('free_gap_hours')}h")
    if best.get("wait") is not None:
        parts.append(f"wait ~{best.get('wait')}h")
    if best.get("travel_time"):
        parts.append(f"travel time {best.get('travel_time')}")
    if best.get("distance"):
        parts.append(f"distance {best.get('distance')}")
    if best.get("fully_booked_at_arrival"):
        parts.append(f"fully booked at arrival (wait ~{best.get('wait_hours')}h)")

    if not parts:
        return "it best matches the available station data."
    return "it has the best overall balance: " + ", ".join(parts) + "."


async def generate_voice_base64(text: str) -> str:
    voice = "en-US-SteffanNeural"
    communicate = edge_tts.Communicate(text, voice)
    audio_data = b""
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_data += chunk["data"]
    return base64.b64encode(audio_data).decode("utf-8")


# ==========================
# 6) Google Places Helpers (WITH LOGS)
# ==========================
def google_places_nearby(lat: float, lng: float, place_type: str, radius_m: int = 2500, keyword: str = "") -> List[dict]:
    if not GMAPS_API_KEY:
        log("[SRC:PLACES]", "❌ API key missing -> returning empty")
        return []

    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {
        "key": GMAPS_API_KEY,
        "location": f"{lat},{lng}",
        "radius": radius_m,
        "type": place_type,
    }
    if keyword:
        params["keyword"] = keyword

    log("[SRC:PLACES]", f"request type={place_type} radius={radius_m} location={lat},{lng} keyword={keyword}")
    try:
        r = requests.get(url, params=params, timeout=15)
        data = r.json()

        status = data.get("status")
        log("[SRC:PLACES]", f"response status={status}")
        if status != "OK":
            log("[SRC:PLACES]", f"error_message={data.get('error_message')}")
            return []

        results = []
        for p in data.get("results", [])[:8]:
            results.append({
                "name": p.get("name"),
                "rating": p.get("rating"),
                "user_ratings_total": p.get("user_ratings_total"),
                "open_now": (p.get("opening_hours") or {}).get("open_now"),
                "address": p.get("vicinity"),
                "place_id": p.get("place_id"),
                "types": p.get("types", []),
            })

        log_json("[SRC:PLACES]", "sample_results", results[:2])
        return results
    except Exception as e:
        log("[SRC:PLACES]", f"❌ places request failed: {e}")
        return []


def ml_activities_to_place_requests(activities: str) -> List[dict]:
    t = (activities or "").lower()
    reqs: List[dict] = []

    if any(k in t for k in ["snack", "meal", "lunch", "dinner", "breakfast", "restaurant"]):
        reqs.append({"type": "restaurant", "keyword": "snack", "label": "Food / Snack"})
        reqs.append({"type": "cafe", "keyword": "coffee", "label": "Cafe"})

    if any(k in t for k in ["supermarket", "grocery", "shopping", "store"]):
        reqs.append({"type": "supermarket", "keyword": "", "label": "Supermarket"})
        reqs.append({"type": "shopping_mall", "keyword": "", "label": "Shopping"})

    if any(k in t for k in ["rest", "hotel", "sleep"]):
        reqs.append({"type": "lodging", "keyword": "", "label": "Rest / Stay"})

    if not reqs:
        reqs = [
            {"type": "restaurant", "keyword": "", "label": "Restaurants"},
            {"type": "cafe", "keyword": "", "label": "Cafes"},
        ]

    uniq = []
    seen = set()
    for r in reqs:
        k = (r["type"], r.get("keyword", ""))
        if k in seen:
            continue
        seen.add(k)
        uniq.append(r)

    return uniq[:3]


# ==========================
# 7) LangChain tools (PLACES + OTHER STATIONS)
# ==========================
@tool
def tool_places_for_ml_activities(station_lat: float, station_lng: float, activities: str) -> str:
    """
    Use Google Places Nearby Search to fetch real places near a station based on ML activities.

    Args:
        station_lat: Station latitude
        station_lng: Station longitude
        activities: ML predicted activities string

    Returns:
        JSON string:
        {"activities": "...", "suggestions": [{"label": "...", "place_type": "...", "items": [...] }]}
    """
    try:
        if not GMAPS_API_KEY:
            return json.dumps({"error": "GOOGLE_MAPS_API_KEY missing", "activities": activities, "suggestions": []})

        requests_list = ml_activities_to_place_requests(activities)
        suggestions = []
        for r in requests_list:
            items = google_places_nearby(
                float(station_lat),
                float(station_lng),
                place_type=r["type"],
                radius_m=2500,
                keyword=r.get("keyword", ""),
            )
            suggestions.append({
                "label": r["label"],
                "place_type": r["type"],
                "items": items[:5],
            })

        return json.dumps({"activities": activities, "suggestions": suggestions})
    except Exception as e:
        return json.dumps({"error": str(e), "activities": activities, "suggestions": []})


@tool
def tool_other_stations(stations_json: str) -> str:
    """
    Return top alternative stations from sorted stations JSON.

    Args:
        stations_json: JSON string list of stations (sorted_list)

    Returns:
        JSON string:
        {"others":[{"name","wait_h","drive","distance","charger_id","arrival_time","free_gap_h","fully_booked_at_arrival"}]}
    """
    try:
        sorted_stations = json.loads(stations_json) if stations_json else []
        items = []
        for s in (sorted_stations or [])[:5]:
            items.append({
                "name": s.get("name"),
                "wait_h": s.get("wait"),
                "drive": s.get("travel_time"),
                "distance": s.get("distance"),
                "charger_id": s.get("charger_id"),
                "arrival_time": s.get("arrival_time"),
                "free_gap_h": s.get("free_gap_hours"),
                "fully_booked_at_arrival": s.get("fully_booked_at_arrival"),
            })
        return json.dumps({"others": items})
    except Exception as e:
        return json.dumps({"error": str(e), "others": []})


# ==========================
# 8) Agent Prompt
# ==========================
SYSTEM = """
You are AMPORA ⚡ (Sri Lanka EV travel assistant).

Rules:
- Speak like a helpful human, short answers (2–5 sentences).
- If user asks "why", explain using exact station metrics (wait/travel_time/distance/free_gap/arrival/charger_id) from context.
- NEVER invent ratings or open hours.
- If user asks for shops/places related to activities, call tool_places_for_ml_activities.
- Reply in the same language as the user.
"""

prompt = ChatPromptTemplate.from_messages([
    SystemMessage(content=SYSTEM),
    MessagesPlaceholder(variable_name="chat_history"),
    ("user", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad"),
])

tools = [
    tool_places_for_ml_activities,
    tool_other_stations,
]

agent = create_tool_calling_agent(lc_llm, tools, prompt)
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,
    handle_parsing_errors=True,
    max_iterations=3,
    early_stopping_method="generate",
)

def get_lc_history(conversation_id: str) -> ChatMessageHistory:
    if conversation_id not in CHAT_STORE:
        CHAT_STORE[conversation_id] = {"messages": [], "user_type": "Casual_Driver", "lc_history": ChatMessageHistory()}
    if "lc_history" not in CHAT_STORE[conversation_id]:
        CHAT_STORE[conversation_id]["lc_history"] = ChatMessageHistory()
    return CHAT_STORE[conversation_id]["lc_history"]

runnable = RunnableWithMessageHistory(
    agent_executor,
    get_lc_history,
    input_messages_key="input",
    history_messages_key="chat_history",
)

# ==========================
# ✅ Attach chargers + bookings from DB (FIXED)
# ==========================
def _resolve_missing_station_ids(stations_list: List[dict]) -> None:
    """
    FIXED:
    - Used ILIKE %name% instead of exact name matching to handle small variations in names
    - Increased latitude/longitude tolerance (0.002 ≈ ~200m range)
    - Selected the nearest station_id instead of relying on a direct match
    """
    missing = [s for s in stations_list if not (s.get("station_id") or s.get("stationId"))]
    if not missing:
        return

    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            for s in missing:
                nm = (s.get("name") or "").strip()
                lat = s.get("lat")
                lng = s.get("lng")

                if lat is None or lng is None:
                    continue

                # ✅ single query: name fuzzy OR nearest coords
                try:
                    cur.execute(
                        """
                        SELECT station_id
                        FROM station
                        WHERE ( %s <> '' AND name ILIKE %s )
                           OR (ABS(latitude - %s) < 0.002 AND ABS(longitude - %s) < 0.002)
                        ORDER BY (ABS(latitude - %s) + ABS(longitude - %s)) ASC
                        LIMIT 1
                        """,
                        (nm, f"%{nm}%", lat, lng, lat, lng),
                    )
                    row = cur.fetchone()
                    if row and row.get("station_id"):
                        s["station_id"] = row["station_id"]
                except Exception:
                    continue
    finally:
        conn.close()


def attach_chargers_and_bookings(stations_list: List[dict]) -> List[dict]:
    """
    FIXED:
    - station_id resolve logs
    - if station_ids empty -> set chargers=[] explicitly (so analyze gets consistent structure)
    - booking_status filter more tolerant (avoid missing if status not exactly CONFIRMED)
    """
    if not stations_list:
        return stations_list

    _resolve_missing_station_ids(stations_list)

    station_ids = []
    for s in stations_list:
        sid = s.get("station_id") or s.get("stationId")
        if sid:
            station_ids.append(sid)

    log("[SRC:DB]", f"attach: station_ids={station_ids}")

    if not station_ids:
        log("[SRC:DB]", "attach: ❌ station_ids empty -> cannot attach chargers/bookings")
        for s in stations_list:
            s["chargers"] = s.get("chargers") or []
        return stations_list

    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # chargers
            cur.execute(
                """
                SELECT charger_id, station_id
                FROM charger
                WHERE station_id = ANY(%s)
                """,
                (station_ids,),
            )
            charger_rows = cur.fetchall()
            log("[SRC:DB]", f"attach: chargers_found={len(charger_rows)}")

            station_to_chargers: Dict[str, List[dict]] = {}
            charger_ids: List[str] = []
            for r in charger_rows:
                sid = r["station_id"]
                cid = r["charger_id"]
                charger_ids.append(cid)
                station_to_chargers.setdefault(sid, []).append({"charger_id": cid, "bookings": []})

            booking_rows = []
            if charger_ids:
                cur.execute(
                    """
                    SELECT charger_id, start_time, end_time, booking_status
                    FROM booking
                    WHERE charger_id = ANY(%s)
                      AND end_time > NOW()
                      AND start_time < NOW() + INTERVAL '24 hours'
                      AND (booking_status IS NULL OR booking_status NOT IN ('CANCELLED', 'REJECTED'))
                    ORDER BY charger_id, start_time
                    """,
                    (charger_ids,),
                )
                booking_rows = cur.fetchall()
                log("[SRC:DB]", f"attach: bookings_found={len(booking_rows)}")
            else:
                log("[SRC:DB]", "attach: bookings_found=0 (no chargers)")

        charger_to_bookings: Dict[str, List[dict]] = {}
        for b in booking_rows:
            cid = b["charger_id"]
            st = b["start_time"]
            en = b["end_time"]
            charger_to_bookings.setdefault(cid, []).append({
                "start_time": st.isoformat() if hasattr(st, "isoformat") else str(st),
                "end_time": en.isoformat() if hasattr(en, "isoformat") else str(en),
            })

        for s in stations_list:
            sid = s.get("station_id") or s.get("stationId")
            chargers = station_to_chargers.get(sid, [])
            for ch in chargers:
                ch["bookings"] = charger_to_bookings.get(ch["charger_id"], [])
            s["chargers"] = chargers

        log("[SRC:DB]", f"attach: chargers_per_station={[(s.get('name'), len(s.get('chargers') or [])) for s in stations_list]}")
        return stations_list

    except Exception as e:
        log("[SRC:DB]", f"❌ attach_chargers_and_bookings failed: {e}")
        for s in stations_list:
            s["chargers"] = s.get("chargers") or []
        return stations_list
    finally:
        conn.close()


# ==========================
# 9) Endpoint: get-nearby-stations (UNCHANGED)
# ==========================
@app.post("/get-nearby-stations")
async def get_nearby_stations(req: NearbyStationsRequest):
    path_points = req.path_points or []
    if not path_points:
        return {"stations": []}

    lats = [p["lat"] for p in path_points]
    lngs = [p["lng"] for p in path_points]

    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT station_id, name, latitude as lat, longitude as lng, address, status
                FROM station
                WHERE latitude BETWEEN %s AND %s
                  AND longitude BETWEEN %s AND %s
                """,
                (min(lats) - 0.1, max(lats) + 0.1, min(lngs) - 0.1, max(lngs) + 0.1),
            )
            rows = cur.fetchall()

        for r in rows:
            r["lat"] = float(r["lat"])
            r["lng"] = float(r["lng"])

        log("[SRC:DB]", f"stations_returned={len(rows)}")
        return {"stations": rows}
    except Exception as e:
        log("[SRC:DB]", f"❌ DB error: {e}")
        return {"stations": [], "error": str(e)}
    finally:
        conn.close()


# ==========================
# 10) Endpoint: chat (MAIN) - minimal changes for new feature
# ==========================
@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    try:
        user_text = req.user_text or ""
        log("[CHAT]", f"user_text={user_text}")

        if req.conversation_id not in CHAT_STORE:
            CHAT_STORE[req.conversation_id] = {
                "messages": [],
                "user_type": "Casual_Driver",
                "lc_history": ChatMessageHistory(),
            }

        store = CHAT_STORE[req.conversation_id]
        store["messages"].append({"role": "user", "text": user_text})

        if is_greeting(user_text):
            assistant_text = "Hello! 👋 How can I help you with your EV trip today?"
            store["messages"].append({"role": "ai", "text": assistant_text})
            audio_str = None
            try:
                audio_str = await generate_voice_base64(assistant_text)
            except Exception as e:
                log("[SAFE]", f"voice failed: {e}")
            return ChatResponse(
                conversation_id=req.conversation_id,
                assistant_text=assistant_text,
                user_type=store.get("user_type", "Casual_Driver"),
                best_station=None,
                sorted_stations=[],
                audio_base64=audio_str,
            )

        if (store.get("user_type") is None) or (store.get("user_type") == "Casual_Driver" and should_reinfer_user_type(user_text)):
            store["user_type"] = infer_user_type_llm(user_text, store["messages"], req.start_city, req.end_city)
            log("[CHAT]", f"inferred user_type={store['user_type']}")

        stations_list = [s.model_dump() for s in req.stations] if req.stations else []
        origin_val = get_origin(req)

        stations_list = attach_chargers_and_bookings(stations_list)

        # ✅ EXTRA debug to confirm station_id + chargers attached
        log("[DBG]", f"station_ids_in_payload={[s.get('station_id') for s in stations_list]}")
        log("[DBG]", f"chargers_per_station={[(s.get('name'), len(s.get('chargers') or [])) for s in stations_list]}")

        log("[SRC:GMAPS_DISTANCE]", f"computing best station origin={origin_val} stations={len(stations_list)}")
        best, sorted_list = analyze_stations_logic(origin_val, stations_list)

        if not best:
            assistant_text = "⚠️ I couldn't find a suitable station. Try another route or increase station coverage."
            store["messages"].append({"role": "ai", "text": assistant_text})
            audio_str = None
            try:
                audio_str = await generate_voice_base64(assistant_text)
            except Exception as e:
                log("[SAFE]", f"voice failed: {e}")
            return ChatResponse(
                conversation_id=req.conversation_id,
                assistant_text=assistant_text,
                user_type=store.get("user_type", "Casual_Driver"),
                best_station=None,
                sorted_stations=[],
                audio_base64=audio_str,
            )

        log("[SRC:GMAPS_DISTANCE]",
            f"✅ best={best.get('name')} charger={best.get('charger_id')} "
            f"gap_h={best.get('free_gap_hours')} wait_h={best.get('wait_hours')} "
            f"travel={best.get('travel_time')} dist={best.get('distance')} arrival={best.get('arrival_time')}"
        )

        charging_minutes = random.choice([30, 60, 90, 120, 150, 180, 210])
        log("[SRC:ML]", f"predicting activities user_type={store['user_type']} charging_minutes={charging_minutes}")
        activities = predict_activities(store["user_type"], charging_minutes)
        log("[SRC:ML]", f"activities={activities}")

        store["last_best_station"] = best
        store["last_sorted_stations"] = sorted_list
        store["last_activities"] = activities
        store["last_charging_minutes"] = charging_minutes

        if wants_best_station(user_text):
            name = best.get("name")
            charger_id = best.get("charger_id")
            tt = best.get("travel_time")
            dist = best.get("distance")
            arrival = best.get("arrival_time")
            gap_h = best.get("free_gap_hours")
            fully = best.get("fully_booked_at_arrival")
            wait_h = best.get("wait_hours")

            if fully:
                assistant_text = (
                    f"At your arrival time (~{arrival}), {name} is fully booked. "
                    f"Estimated wait: ~{wait_h} hours. I recommend another station. "
                    f"While charging later, you can: {activities}."
                )
            else:
                assistant_text = (
                    f"The best station is {name} (charger {charger_id}). "
                    f"Arrival ~{arrival}. Travel time: {tt}, Distance: {dist}. "
                    f"Free window after arrival: ~{gap_h} hours. "
                    f"While charging, you can: {activities}."
                )

        elif is_why_question(user_text):
            assistant_text = f"I picked {best.get('name')} because {format_station_reason(best)}"

        elif wants_travel_time(user_text):
            tt = best.get("travel_time")
            dist = best.get("distance")
            if not tt:
                assistant_text = "I can’t confirm the travel time right now (missing data)."
                log("[SAFE]", "travel_time missing")
            else:
                assistant_text = f"Travel time to {best.get('name')} is {tt} ({dist})."

        elif wants_places(user_text):
            places_json = tool_places_for_ml_activities.invoke({
                "station_lat": float(best.get("lat")),
                "station_lng": float(best.get("lng")),
                "activities": activities,
            })

            try:
                places_data = json.loads(places_json)
            except Exception:
                places_data = {"suggestions": []}

            suggestions = places_data.get("suggestions", [])
            if not suggestions:
                if not GMAPS_API_KEY:
                    assistant_text = "I can’t fetch places right now because the Google Maps API key is missing."
                    log("[SAFE]", "places requested but API key missing")
                else:
                    assistant_text = "I couldn’t fetch nearby places right now (Google Places returned no results). Try again in a moment."
                    log("[SAFE]", "places empty")
            else:
                lines = []
                for block in suggestions[:2]:
                    label = block.get("label", "Places")
                    items = (block.get("items") or [])[:3]
                    if not items:
                        continue
                    lines.append(f"{label}:")
                    for it in items:
                        nm = it.get("name", "Unknown")
                        rt = it.get("rating")
                        op = it.get("open_now")
                        rt_txt = f"{rt}⭐" if rt is not None else "No rating"
                        op_txt = "Open now" if op is True else ("Closed now" if op is False else "Open status unknown")
                        addr = it.get("address")
                        if addr:
                            lines.append(f"- {nm} ({rt_txt}, {op_txt}) — {addr}")
                        else:
                            lines.append(f"- {nm} ({rt_txt}, {op_txt})")

                if not lines:
                    assistant_text = "I couldn’t find matching places with ratings/open info right now."
                    log("[SAFE]", "places suggestions had no items")
                else:
                    assistant_text = "Here are a few nearby spots that match your activities:\n" + "\n".join(lines)

        else:
            stations_top5_json = json.dumps(sorted_list[:5], ensure_ascii=False)

            agent_input = f"""
Trip: {req.start_city} -> {req.end_city}
User type: {store["user_type"]}
SOC: {req.soc_level}%

Best station truth:
name={best.get("name")}
charger_id={best.get("charger_id")}
arrival_time={best.get("arrival_time")}
free_gap_hours={best.get("free_gap_hours")}
fully_booked_at_arrival={best.get("fully_booked_at_arrival")}
wait_hours={best.get("wait_hours")}
lat={best.get("lat")}
lng={best.get("lng")}
travel_time={best.get("travel_time")}
distance={best.get("distance")}

Charging estimate minutes: {charging_minutes}
ML activities: {activities}

Top other stations JSON:
{stations_top5_json}

User message: {user_text}

If user asks for places/shops/restaurants/supermarkets for activities:
- call tool_places_for_ml_activities(station_lat, station_lng, activities)
If user asks other stations:
- call tool_other_stations(stations_json=top other stations JSON string)

Reply short and friendly. If you don't have data, say you can't confirm right now (don't invent).
""".strip()

            try:
                result = runnable.invoke(
                    {"input": agent_input},
                    config={"configurable": {"session_id": req.conversation_id}},
                )
                assistant_text = (result.get("output") if isinstance(result, dict) else str(result)).strip()
                if not assistant_text:
                    assistant_text = f"Best station is {best.get('name')}. Want nearby places for: {activities}?"
            except Exception as e:
                log("[SAFE]", f"Agent failed: {e}")
                assistant_text = f"Best station is {best.get('name')}. Want nearby places for: {activities}?"

        audio_str = None
        try:
            audio_str = await generate_voice_base64(assistant_text)
        except Exception as e:
            log("[SAFE]", f"Voice generation failed: {e}")

        store["messages"].append({"role": "ai", "text": assistant_text})

        return ChatResponse(
            conversation_id=req.conversation_id,
            assistant_text=assistant_text,
            user_type=store.get("user_type", "Casual_Driver"),
            best_station=best,
            sorted_stations=sorted_list,
            audio_base64=audio_str,
        )

    except Exception:
        traceback.print_exc()
        return ChatResponse(
            conversation_id=req.conversation_id,
            assistant_text="⚠️ Error processing chat. Please try again.",
            user_type="Casual_Driver",
            best_station=None,
            sorted_stations=[],
            audio_base64=None,
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)
