import requests
# Conectando a api da photon e requisitando
# Nome, Estado, País e suas coordenadas

url = "https://photon.komoot.io/api/"
params = {"q": "sao paulo", "limit": 15}
headers = {
    "Accept": "application/json",
    "User-Agent": "Mozilla/5.0 (compatible; CSR-geocode/1.0)",
}

visto = set()
response = requests.get(url, params=params, headers=headers, timeout=10)
json_responde = response.json()
data = response.json()

for cid in data["features"]:

    propriedade = cid["properties"]
    long, lati = cid["geometry"]["coordinates"]
    state = propriedade.get("state")
    name = propriedade.get("name")
    country = propriedade.get("country")
    chave = (name, state, country)
    
    if chave in visto:
        continue  # já foi usado essa combinação, pula para o proximo
    if country != "Brasil":
        continue
    if state is None or name is None or country is None:
        continue  # pula esse resultado e vai para o próximo
   
    visto.add(chave)
    print(f"{propriedade.get("name")}", f"{propriedade.get("state", "N/A")}", f"{propriedade.get("country")}")
