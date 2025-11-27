import requests
import datetime


class no_book:

    def get_travel_time_with_traffic(self, origin, destination, depart_time=None):
        API_KEY = "sw7UYhooKEn86ddxxo9AIt9D6CzmattH"

        if depart_time is None:
            depart_time = datetime.datetime.utcnow()

        depart_str = depart_time.strftime("%Y-%m-%dT%H:%M:%SZ")

        url = (
            "https://api.tomtom.com/routing/1/calculateRoute/{orig}:{dest}/json"
            .format(
                orig=f"{origin[0]},{origin[1]}",
                dest=f"{destination[0]},{destination[1]}"
            )
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

        return summary["travelTimeInSeconds"]

    def get_best_destination(self, origin, destinations):
        results = []

        for dest in destinations:
            try:
                travel_time = self.get_travel_time_with_traffic(origin, dest)

                results.append({
                    "destination": dest,
                    "travel_time": travel_time
                })

            except Exception as e:
                print("Error for destination:", dest, e)

        return results
