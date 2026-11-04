import requests

url = f"http://router.project-osrm.org/route/v1/driving"
params = {"overview": "full", "geometries": "geojson"}
headers = {
       "Accept": "application/json",
       "User-Agent": "Mozilla/5.0 (compatible; photon/1.0)"
}
def calcular_rota(origem, destino):
       coordenadas = f"{origem['lon']},{origem['lat']};{destino['lon']},{destino['lat']}"
       response = requests.get(f"{URL_BASE}/{coordenadas}", params=params, headers=headers, timeout=10)
       response.raise_for_status() #retorna caso ocorra um erro
       dados = response.json()

       if not dados.get("routes"):
              raise ValueError("Nenhuma rota encontrada entre as cidades.")

       rota = dados["routes"][0]
       return  {
              "distancia_km": round(rota["distance"] / 1000, 1),
              "duracao_min": round(rota["duration"] / 60),
              "pontos": rota["geometry"]["coordinates"],

       }

