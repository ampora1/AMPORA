
import requests
import folium
import os
from geopy.distance import geodesic
from datetime import datetime
from flask import current_app

from models import db, City, ChargingStation


class EnhancedEVPlanner:
    def __init__(self):
        self.osrm_url = "http://router.project-osrm.org/route/v1/driving/"

        self.cities = {}
        self.charging_stations = {}




    def _load_data_from_db(self):

        try:
            if not current_app:
                raise RuntimeError("Must be run within a Flask application context")


            self.cities = {}
            for city in City.query.all():
                self.cities[city.name] = (city.latitude, city.longitude)


            self.charging_stations = {}
            for station in ChargingStation.query.all():
                station_data = station.to_dict()
                province = station_data['province']

                if province not in self.charging_stations:
                    self.charging_stations[province] = []

                self.charging_stations[province].append({
                    'name': station_data['name'],
                    'city': station_data['city'],
                    'type': station_data['type'],
                    'power': station_data['power'],
                    'operator': station_data['operator'],
                    'lat': station_data['lat'],
                    'lon': station_data['lon'],
                })

            print(
                f"DB Data Loaded: {len(self.cities)} Cities, {sum(len(v) for v in self.charging_stations.values())} Stations.")

        except Exception as e:
            print(f" DB Loading Error: {e}. Check MySQL connection.")
            self.cities = {}
            self.charging_stations = {}

    def get_route_from_osrm(self, start_coords, end_coords, alternatives=3):

        try:
            waypoints = f"{start_coords[1]},{start_coords[0]};{end_coords[1]},{end_coords[0]}"
            url = f"{self.osrm_url}{waypoints}"
            params = {"overview": "full", "geometries": "geojson", "steps": "true", "alternatives": "true"}
            response = requests.get(url, params=params, timeout=15)

            if response.status_code == 200:
                data = response.json()
                if data['code'] == 'Ok' and len(data['routes']) > 0:
                    routes = []
                    max_routes = min(alternatives, len(data['routes']))

                    for i in range(max_routes):
                        route = data['routes'][i]
                        coordinates = [[coord[1], coord[0]] for coord in route['geometry']['coordinates']]
                        routes.append({
                            'route_number': i + 1,
                            'coordinates': coordinates,
                            'distance': route['distance'] / 1000,
                            'duration': route['duration'] / 60,
                        })
                    routes.sort(key=lambda x: x['distance'])
                    return routes
            return None
        except Exception as e:
            return None

    def find_charging_stations_near_route(self, route_coords, max_distance_km=5):

        nearby_stations = []
        for city, stations in self.charging_stations.items():
            for station in stations:
                station_coords = (station['lat'], station['lon'])
                min_distance = float('inf')
                for i in range(0, len(route_coords), max(1, len(route_coords) // 50)):
                    route_point = route_coords[i]
                    point_coords = (route_point[0], route_point[1])
                    try:
                        distance = geodesic(station_coords, point_coords).kilometers
                        if distance < min_distance:
                            min_distance = distance
                    except:
                        continue
                if min_distance <= max_distance_km:
                    station_with_distance = station.copy()
                    station_with_distance['distance_to_route'] = round(min_distance, 2)
                    nearby_stations.append(station_with_distance)
        return nearby_stations


    def create_route_with_charging_map(self, start_city, end_city):

        self._load_data_from_db()

        if start_city not in self.cities or end_city not in self.cities:
            return None

        start_coords = self.cities[start_city]
        end_coords = self.cities[end_city]
        routes_data = self.get_route_from_osrm(start_coords, end_coords, 3)

        if not routes_data:
            return None

        center_lat = (start_coords[0] + end_coords[0]) / 2
        center_lon = (start_coords[1] + end_coords[1]) / 2

        m = folium.Map(location=[center_lat, center_lon], zoom_start=8, tiles='OpenStreetMap')

        route_colors = ['#3498db', '#e74c3c', '#2ecc71']
        on_route_stations = set()


        for i, route in enumerate(routes_data):
            route_coords = route.get('coordinates', [])
            if len(route_coords) > 1:
                color = route_colors[i % len(route_colors)]
                folium.PolyLine(
                    route_coords, color=color, weight=6, opacity=0.8,
                    tooltip=f"Route {i + 1} - {route.get('distance', 0):.1f} km"
                ).add_to(m)

            if i == 0:
                charging_stations = self.find_charging_stations_near_route(route_coords)
                for station in charging_stations:
                    on_route_stations.add((station['lat'], station['lon']))


        all_stations = []
        for city, stations in self.charging_stations.items():
            all_stations.extend(stations)

        stations_on_route = 0

        for station in all_stations:
            station_coords = (station['lat'], station['lon'])
            is_on_route = station_coords in on_route_stations

            if is_on_route:
                stations_on_route += 1

            color = 'orange' if is_on_route else 'blue'
            popup_text = f"🔌 <b>{station['name']}</b><br>City: {station['city']}<br>Type: {station['type']}<br>Power: {station['power']}"

            folium.Marker(
                [station['lat'], station['lon']],
                popup=folium.Popup(popup_text, max_width=300),
                icon=folium.Icon(color=color, icon='bolt', prefix='fa'),
                tooltip=f"{station['name']} ({'On Route' if is_on_route else 'Other'})"
            ).add_to(m)


        folium.Marker(
            start_coords, popup=folium.Popup(f" <b>Start: {start_city}</b>", max_width=200),
            icon=folium.Icon(color='green', icon='play', prefix='fa')
        ).add_to(m)

        folium.Marker(
            end_coords, popup=folium.Popup(f"🏁 <b>Destination: {end_city}</b>", max_width=200),
            icon=folium.Icon(color='red', icon='flag-checkered', prefix='fa')
        ).add_to(m)


        legend_html = f'''
        <div style="position: fixed; top: 10px; left: 50px; z-index: 1000; background-color: white; padding: 10px; border: 2px solid grey; border-radius: 5px; font-family: Arial;">
            <h4>Routes: {start_city} → {end_city}</h4>
        '''
        for i, route in enumerate(routes_data):
            color_text = '🔵' if i == 0 else '🔴' if i == 1 else '🟢'
            legend_html += f'<p>{color_text} Route {i + 1} {"(Shortest)" if i == 0 else ""} - <b>{route["distance"]:.1f} km</b></p>'

        legend_html += f'''
            <p style="margin-top:10px;">⚡ Stations on Route: <b style="color: orange;">{stations_on_route}</b></p>
            <p>⚡ Total Stations: {len(all_stations)}</p>
        </div>
        '''
        m.get_root().html.add_child(folium.Element(legend_html))

        # 5. Save map
        os.makedirs("maps", exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        map_filename = f"route_{start_city}_to_{end_city}_{timestamp}.html"
        map_filepath = os.path.join("maps", map_filename)
        m.save(map_filepath)

        return map_filename