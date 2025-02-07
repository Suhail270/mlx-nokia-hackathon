import requests

def get_nearby_establishments(lat, lon, radius=1000):
    overpass_url = "https://overpass-api.de/api/interpreter"
    
    query = f"""
    [out:json];
    node(around:{radius},{lat},{lon})[amenity];
    out;
    """

    response = requests.get(overpass_url, params={'data': query})
    data = response.json()

    places = []
    for element in data.get("elements", []):
        name = element.get("tags", {}).get("name", "Unnamed Place")
        amenity = element.get("tags", {}).get("amenity", "Unknown")
        places.append({"name": name, "type": amenity})

    return places[:5]

