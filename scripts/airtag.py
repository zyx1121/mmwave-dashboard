import os
import subprocess
import math
import time
import requests


class AirTag:
    def __init__(self, *airtag_names):
        self.airtags = {name: None for name in airtag_names}
        self.DATA_PATH = os.path.join(
            os.path.expanduser("~"),
            "Library/Caches/com.apple.findmy.fmipcore/Items.data",
        )

    def get_location(self, name):
        if name not in self.airtags:
            raise ValueError(f"Invalid AirTag name: {name}")

        command = [
            "jq",
            "-r",
            f'.[] | select(.name == "{name}") | .location | "\\(.latitude) \\(.longitude) \\(.altitude) \\(.timeStamp / 1000 | todate)"',
            self.DATA_PATH,
        ]

        result = subprocess.run(command, capture_output=True, text=True)

        if result.returncode == 0:
            output = result.stdout.strip()
            if output:
                latitude, longitude, altitude, timestamp = output.split()
                self.airtags[name] = {
                    "latitude": float(latitude),
                    "longitude": float(longitude),
                    "altitude": float(altitude),
                    "timestamp": timestamp,
                }
                return self.airtags[name]
        else:
            raise RuntimeError(f"Command failed with error: {result.stderr}")

    def update_node_location(self, node_id, lat, lng):
        url = "http://localhost:3000/api/location"
        data = {"id": node_id, "lat": lat, "lng": lng}

        try:
            response = requests.put(url, json=data)
            response.raise_for_status()

            updated_node = response.json()
            print("Node updated:", updated_node)
            return updated_node

        except requests.exceptions.RequestException as e:
            print("Error updating node:", e)
            return None

    def get_distance(self, name1, name2):
        loc1 = self.get_location(name1)
        loc2 = self.get_location(name2)

        return self._calculate_distance(
            loc1["latitude"], loc1["longitude"], loc2["latitude"], loc2["longitude"]
        )

    def _calculate_distance(self, lat1, lon1, lat2, lon2):
        R = 6371000  # Earth radius in meters

        lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])

        dlat = lat2 - lat1
        dlon = lon2 - lon1

        a = (
            math.sin(dlat / 2) ** 2
            + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
        )
        c = 2 * math.asin(math.sqrt(a))

        return R * c


if __name__ == "__main__":
    AIRTAG_IDS_MAP = {
        "WiseAirTag1": 1,
        "WiseAirTag2": 2,
        "WiseAirTag3": 3,
        "WiseAirTag4": 4,
    }

    airtags = AirTag("WiseAirTag1", "WiseAirTag2", "WiseAirTag3", "WiseAirTag4")

    while True:
        for name in airtags.airtags:
            location = airtags.get_location(name)
            airtags.update_node_location(
                AIRTAG_IDS_MAP[name], location["latitude"], location["longitude"]
            )
        time.sleep(1)
