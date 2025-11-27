
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class ChargingStation(db.Model):
    __tablename__ = 'charging_stations'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    city = db.Column(db.String(80), nullable=False)
    province = db.Column(db.String(80), nullable=False)
    type = db.Column(db.String(50))
    power = db.Column(db.String(50))
    operator = db.Column(db.String(80))
    lat = db.Column(db.Float, nullable=False)
    lon = db.Column(db.Float, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'city': self.city,
            'province': self.province,
            'type': self.type,
            'power': self.power,
            'operator': self.operator,
            'lat': self.lat,
            'lon': self.lon
        }


class City(db.Model):
    __tablename__ = 'cities'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'latitude': self.latitude,
            'longitude': self.longitude,
        }