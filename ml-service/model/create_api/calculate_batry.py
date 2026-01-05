class BatteryRange:
    def __init__(self, full_range_km=150):
        self.full_range = full_range_km

    def get_range(self, soc):
        return (soc / 100) * self.full_range

