import requests
import datetime

API_KEY = "sw7UYhooKEn86ddxxo9AIt9D6CzmattH"


def get_travel_time_with_traffic(origin, destination, depart_time=None):
    if depart_time is None:
        depart_time = datetime.datetime.utcnow()

    depart_str = depart_time.strftime("%Y-%m-%dT%H:%M:%SZ")

    url = (
        "https://api.tomtom.com/routing/1/calculateRoute/{orig}:{dest}/json"
        .format(orig=f"{origin[0]},{origin[1]}", dest=f"{destination[0]},{destination[1]}")
    )

    params = {
        "key": API_KEY,
        "traffic": "true",
        "departAt": depart_str,
        "computeTravelTimeFor": "all",
        "travelMode": "car",
    }

    resp = requests.get(url, params=params)
    data = resp.json()

    if "routes" not in data or len(data["routes"]) == 0:
        raise Exception("No route returned from TomTom API: " + str(data))

    summary = data["routes"][0]["summary"]
    result = {
        "travel_time": summary["travelTimeInSeconds"],  # with traffic
        "delay": summary.get("trafficDelayInSeconds", None),  # traffic delay
        "no_traffic_time": summary.get("noTrafficTravelTimeInSeconds", None)
    }
    return result


origin = (6.9271, 79.8612)
destination = (7.2906, 80.6320)

times = get_travel_time_with_traffic(origin, destination)
print("Travel time (with traffic):", times["travel_time"], "seconds")
print("Traffic delay:", times["delay"], "seconds")
print("No-traffic travel time:", times["no_traffic_time"], "seconds")
