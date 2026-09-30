import requests

lat_origem = -39.073239
long_origem = -13.370232
lat_destino = -39.098571
long_destino = -13.537791

url = f"http://router.project-osrm.org/route/v1/driving/{lat_origem},{long_origem};{lat_destino},{long_destino}"
params = {"overview": "full", "geometries": "geojson"}
headers = {
       "Accept": "application/json",
       "User-Agent": "Mozilla/5.0 (compatible; photon/1.0)"
}

response = requests.get(url, params=params, headers=headers, timeout=10)
json_responde = response.json()

for rota in json_responde["routes"]:
    propriedade = rota["legs"]
    distancia = rota["distance"]
    duracao = rota["duration"]
    print(f"{distancia}, {(duracao / 60):.2f}")



