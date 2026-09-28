import requests

url = "https://photon.komoot.io/api/"
params = {"q": "salvador"}
headers = {
    "Accept": "application/json",
    "User-Agent": "Mozilla/5.0 (compatible; CSR-geocode/1.0)",
}

response = requests.get(url, params=params)

response.raise_for_status()
json_responde = response.json()
data = response.json()
for cid in data["features"]:
    propriedade = cid["proprieties"]
    print(f"Cidade: {propriedade.get(name)}")
