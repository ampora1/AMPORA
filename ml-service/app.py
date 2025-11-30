from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import random

from models import db, City, ChargingStation
from enhanced_ev_planner import EnhancedEVPlanner
from model import no_book

DB_USER = "root"
DB_PASSWORD = ""
DB_HOST = "localhost"
DB_NAME = "ev_planner_db"

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = (f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

planner = EnhancedEVPlanner()
no_booking_pred = no_book()
data_to_seed = EnhancedEVPlanner()

os.makedirs("maps", exist_ok=True)


def seed_database(initial_planner_data):
    with app.app_context():

        db.create_all()

        if City.query.count() == 0:
            print("Seeding Cities...")
            for name, (lat, lon) in initial_planner_data.cities_initial.items():
                db.session.add(City(name=name, latitude=lat, longitude=lon))
            db.session.commit()

        if ChargingStation.query.count() == 0:
            print("Seeding Charging Stations...")
            for province, stations in initial_planner_data.charging_stations_initial.items():
                for station_data in stations:
                    db.session.add(ChargingStation(
                        name=station_data['name'], city=station_data['city'], province=province,
                        type=station_data.get('type'), power=station_data.get('power'),
                        operator=station_data.get('operator'), lat=station_data['lat'], lon=station_data['lon']
                    ))
            db.session.commit()
        else:
            print("Database already populated. Skipping seeding.")


HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sri Lanka EV Route Planner</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 15px; box-shadow: 0 15px 30px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%); color: white; padding: 25px; text-align: center; }
        .header h1 { font-size: 2.2em; margin-bottom: 10px; }
        .content { padding: 25px; }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 8px; font-weight: bold; color: #2c3e50; }
        select { width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px; }
        select:focus { border-color: #3498db; outline: none; }
        button { width: 100%; padding: 15px; background: #e74c3c; color: white; border: none; border-radius: 8px; font-size: 1.1em; font-weight: bold; cursor: pointer; transition: background 0.3s; }
        button:hover { background: #c0392b; }
        .result { margin-top: 20px; padding: 20px; border-radius: 10px; display: none; }
        .success { background: #d4edda; border: 2px solid #c3e6cb; color: #155724; }
        .error { background: #f8d7da; border: 2px solid #f5c6cb; color: #721c24; }
        .loading { text-align: center; padding: 20px; display: none; }
        .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 15px; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .route-info { background: white; padding: 15px; border-radius: 8px; margin: 10px 0; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .map-button { display: inline-block; background: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 5px; transition: background 0.3s; }
        .map-button:hover { background: #2980b9; }
        .legend { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .legend-item { display: flex; align-items: center; margin: 5px 0; }
        .legend-color { width: 20px; height: 20px; border-radius: 50%; margin-right: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Sri Lanka EV Route Planner</h1>
            <p>Find routes with charging stations</p>
        </div>

        <div class="content">
            <form id="routeForm">
                <div class="form-group">
                    <label for="start">Start Location:</label>
                    <select id="start" required>
                        <option value="">Select start city...</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="end">Destination:</label>
                    <select id="end" required>
                        <option value="">Select destination...</option>
                    </select>
                </div>

                <div class="legend">
                    <h4>Map Legend:</h4>
                    <div class="legend-item">
                        <div class="legend-color" style="background: green;"></div>
                        <span>Start Location</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background: red;"></div>
                        <span>Destination</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background: orange;"></div>
                        <span>Charging Stations on Route (near the main route)</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background: blue;"></div>
                        <span>Other Charging Stations (other locations)</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background: #3498db;"></div>
                        <span>Route 1 (Shortest Driving Distance)</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background: #e74c3c;"></div>
                        <span>Route 2</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background: #2ecc71;"></div>
                        <span>Route 3</span>
                    </div>
                </div>

                <button type="submit">Find Routes</button>
            </form>

            <div class="loading" id="loading">
                <div class="spinner"></div>
                <div>Finding routes...</div>
            </div>

            <div id="result" class="result"></div>
        </div>
    </div>

   <script>
    let cities = []; 

    function populateCities() {
        const startSelect = document.getElementById('start');
        const endSelect = document.getElementById('end');

        fetch('/api/cities')
            .then(response => response.json())
            .then(data => {
                cities = data.cities;
                cities.forEach(city => {
                    startSelect.innerHTML += `<option value="${city}">${city}</option>`;
                    endSelect.innerHTML += `<option value="${city}">${city}</option>`;
                });
            })
            .catch(error => {
                console.error('Error fetching cities:', error);
            });
    }

    document.getElementById('routeForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const start = document.getElementById('start').value;
        const end = document.getElementById('end').value;

        const resultDiv = document.getElementById('result');
        const loadingDiv = document.getElementById('loading');

        loadingDiv.style.display = 'block';
        resultDiv.style.display = 'none';
        resultDiv.className = 'result';
        resultDiv.innerHTML = '';

        try {
            const response = await fetch('/api/route', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ start: start, end: end })
            });
            const data = await response.json();

            const bookingResponse = await fetch('/api/best_station', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    start: start,
                    end:end
                    
                    })
            });
            const bookingData = await bookingResponse.json();
            console.log(" BEST STATION RESULT:", bookingData);

            loadingDiv.style.display = 'none';
            resultDiv.style.display = 'block';

            if (data.success) {
                resultDiv.className = 'result success';
                displayRouteResults(data, bookingData, resultDiv);
            } else {
                resultDiv.className = 'result error';
                resultDiv.innerHTML = `<h3>Error</h3><p>${data.error}</p>`;
            }
        } catch (error) {
            loadingDiv.style.display = 'none';
            resultDiv.style.display = 'block';
            resultDiv.className = 'result error';
            resultDiv.innerHTML = `<h3>Connection Error</h3><p>Service is unreachable or network error occurred.</p>`;
        }
    });

    function displayRouteResults(data, bookingData, resultDiv) {
        let html = `<h3>Routes Found!</h3>`;

        html += `<div class="route-info">
                    <h4>Route Summary</h4>
                    <p><strong>From:</strong> ${data.start_city}</p>
                    <p><strong>To:</strong> ${data.end_city}</p>
                    <p><strong>Total Charging Stations on Map:</strong> ${data.total_stations_count}</p>
                    <p><strong>Charging Stations Near Shortest Route:</strong> ${data.charging_stations_count}</p>
                 </div>`;

        html += `<div class="route-info"><h4>Route Alternatives (Driving Distance/Time)</h4>`;
        data.routes.forEach((route, index) => {
            const colors = ['#3498db', '#e74c3c', '#2ecc71'];
            const isShortest = index === 0;
            html += `<div style="border-left: 4px solid ${colors[index]}; padding-left: 15px; margin: 10px 0;">
                        <h5>Route ${index + 1} ${isShortest ? '(Shortest Driving Distance)' : ''}</h5>
                        <p><strong>Distance:</strong> ${route.distance.toFixed(1)} km</p>
                        <p><strong>Duration:</strong> ${route.duration.toFixed(0)} minutes</p>
                     </div>`;
        });
        html += `</div>`;

        if (data.charging_stations && data.charging_stations.length > 0) {
            html += `<div class="route-info"><h4>Charging Stations Near Shortest Route (${data.charging_stations.length})</h4>`;
            data.charging_stations.forEach(station => {
                html += `<div style="margin: 8px 0; padding: 8px; background: #fff3cd; border-radius: 5px;">
                            <strong>${station.name}</strong><br>
                            <small>Type: ${station.type} | Power: ${station.power}</small><br>
                            <small>Distance from Route: ${station.distance_to_route} km</small>
                         </div>`;
            });
            html += `</div>`;
        } else {
            html += `<div class="route-info"><h4>Charging Stations</h4><p>No charging stations found within 10km of the shortest route.</p></div>`;
        }

        if (bookingData.success && bookingData.station_result) {
            html += `<div class="route-info" style="background: #d1ecf1; border: 1px solid #bee5eb;">
                        <h4>Recommended Station Based on Booking Prediction</h4>
                        <p>${bookingData.station_result}</p>
                     </div>`;
        }

        if (data.map_file) {
            html += `<div style="text-align: center; margin-top: 20px;">
                        <a href="/map/${data.map_file}" target="_blank" class="map-button">View Map</a>
                        <a href="/api/download/${data.map_file}" class="map-button" style="background: #27ae60;">Download Map</a>
                     </div>`;
        }

        resultDiv.innerHTML = html;
    }

    document.addEventListener('DOMContentLoaded', function() {
        populateCities();
    });
</script>

</body>
</html>
"""


@app.route('/')
def root():
    """Home Page route."""
    return HTML_TEMPLATE


@app.route('/api/cities')
def get_cities():
    with app.app_context():
        cities_list = [c.name for c in City.query.order_by(City.name).all()]
    return jsonify({"cities": cities_list})


@app.route('/api/route', methods=['POST'])
def calculate_route():
    try:
        data = request.get_json()
        start = data.get('start')
        end = data.get('end')

        if not start or not end:
            return jsonify({"success": False, "error": "Start and End cities are required."})

        with app.app_context():
            start_city_data = City.query.filter_by(name=start).first()
            end_city_data = City.query.filter_by(name=end).first()

            if not start_city_data or not end_city_data:
                return jsonify({"success": False, "error": "One or both cities not found in the database."})

            routes_data = planner.get_route_from_osrm(
                (start_city_data.latitude, start_city_data.longitude),
                (end_city_data.latitude, end_city_data.longitude),
                3
            )

            if not routes_data:
                return jsonify({"success": False, "error": "No routes found."})

            shortest_route_coords = routes_data[0]['coordinates']

            planner._load_data_from_db()
            charging_stations = planner.find_charging_stations_near_route(shortest_route_coords)

            map_file = planner.create_route_with_charging_map(start, end)

            total_stations = sum(len(stations) for stations in planner.charging_stations.values())

            return jsonify({
                "success": True,
                "routes": routes_data,
                "map_file": map_file,
                "charging_stations_count": len(charging_stations),
                "total_stations_count": total_stations,
                "start_city": start,
                "end_city": end,
                "charging_stations": charging_stations
            })

    except Exception as e:
        print(f"Route Error: {e}")
        return jsonify({"success": False, "error": f"Route calculation error: {str(e)}"})


@app.route('/api/best_station', methods=['POST'])
def no_booking():
    try:
        data = request.get_json()
        start = data.get('start')
        end = data.get('end')

        if not start or not end:
            return jsonify({"success": False, "error": "Start and End cities are required."}), 400

        with app.app_context():
            start_city = City.query.filter_by(name=start).first()
            end_city = City.query.filter_by(name=end).first()

            if not start_city or not end_city:
                return jsonify({"success": False, "error": "One or both cities not found in database"}), 400

            start_coords = (start_city.latitude, start_city.longitude)
            end_coords = (end_city.latitude, end_city.longitude)

            routes = planner.get_route_from_osrm(start_coords, end_coords, 3)
            if not routes:
                return jsonify({"success": False, "error": "No routes found"}), 400

            all_stations = []
            for route in routes:
                route_coords = route['coordinates']
                near_stations = planner.find_charging_stations_near_route(route_coords, max_distance_km=5)
                for station in near_stations:
                    filtered_station = {
                        "name": station.get("name"),
                        "lat": station.get("lat"),
                        "lon": station.get("lon")
                    }
                    all_stations.append(filtered_station)

            unique_stations = {(s['lat'], s['lon']): s for s in all_stations}.values()
            unique_list = list(unique_stations)
            destination = []


            for s in unique_list:
                destination.append((s['lat'], s['lon']))
            route_time = no_booking_pred.get_best_destination(start_coords, destination)
            check_station = []
            for i in route_time:
                check_station.append(i)
            best_station = None
            min_final_time = float('inf')
            for station in check_station:
                lat = station['destination'][0]
                lon = station['destination'][1]
                travel_time = station['travel_time']
                name = next((s['name'] for s in all_stations if s['lat'] == lat and s['lon'] == lon), None)

                queue_time = random.randint(30 * 60, 600 * 60)
                final_time = queue_time - travel_time
                print(f"Name: {name}, Lat: {lat}, Lon: {lon}, Travel Time: {travel_time / 60:.2f} min, Queue Time: {queue_time / 60:.2f} min, Final Time: {final_time / 60:.2f} min")

                if final_time <= -30:
                    continue
                elif -30 < final_time < 0:
                    final_time = 0



                if final_time < min_final_time:
                    min_final_time = final_time
                    best_station = {
                        "name": name,
                        "lat": lat,
                        "lon": lon,
                        "travel_time": travel_time,
                        "queue_time": queue_time,
                        "final_time": final_time
                    }
            print("best station")
            print(f"Name: {best_station['name']}, Lat: {best_station['lat']}, Lon: {best_station['lon']}")
            print(f"Travel Time: {best_station['travel_time'] / 60:.2f} min")
            print(f"Queue Time: {best_station['queue_time'] / 60:.2f} min")
            print(f"Final Time: {best_station['final_time'] / 60:.2f} min")

            return jsonify({
                "success": True,
                "routes": routes,
                "near_stations": list(unique_stations)
            })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/map/<filename>')
def get_map_file(filename):
    """Serves the map files"""
    filepath = f"maps/{filename}"
    if os.path.exists(filepath):
        return send_file(filepath)
    return jsonify({"error": "Map file not found"}), 404


@app.route('/api/download/<filename>')
def download_map(filename):
    """Downloads the map"""
    filepath = f"maps/{filename}"
    if os.path.exists(filepath):
        return send_file(
            filepath,
            as_attachment=True,
            download_name=f"EV_ROUTE_{filename}"
        )
    return jsonify({"error": "Map file not found"}), 404


if __name__ == "__main__":
    print("\n--- DB INITIALIZATION ---")
    seed_database(data_to_seed)

    print("--- STARTING APP ---")
    app.run(host="127.0.0.1", port=8000, debug=True)
