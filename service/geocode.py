import requests
# Conectando a api da photon e requisitando
# Nome, Estado, País e suas coordenadas

url = "https://photon.komoot.io/api/"
params = {"q": texto, "limit": 15}
headers = {
    "Accept": "application/json",
    "User-Agent": "Mozilla/5.0 (compatible; CSR-geocode/1.0)",
}
def buscar_cidade(texto, limite=5):
    visto = set()
    response = requests.get(url, params=params, headers=headers, timeout=10)
    data = response.json()

    for cid in data["features"]:

        propriedade = cid["properties"]
        lon, lat = cid["geometry"]["coordinates"]
        state = propriedade.get("state")
        name = propriedade.get("name")
        country = propriedade.get("country")
        chave = (name, state, country)

        if country!= "Brasil" or state is None or name is None or country is None:
            continue  # pula esse resultado e vai para o próximo

        chave = (country, state, name)
            
        if chave in visto:
            continue  # já foi usado essa combinação, pula para o proximo
    
        visto.add(chave)

        resultados.append({"nome": name, "rotulo": f"{state}, {country}, {name}",  "lat": lat, "lon": lon})
        if len(resultados) >= limite:
            break


    return resultados