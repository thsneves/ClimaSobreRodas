import requests
from datetime import date

limite_dias: 16
url = "https://api.open-meteo.com/v1/forecast"
headers = {
    "Accept": "Aplication/json",
     "User-Agent": "Mozilla/5.0 (compatible; CSR-wheaters/1.0)",
}
def buscar_previsao(lat, lon, data):
     response = requests.get(url, params=params, headers=headers, timeout=10)
     daily = response.json()["daily"]
     response.raise_for_status
     if not (0 <= dias <= limite_dias):
          raise ValueError("Data fora do alcance da previsão (hoje até 16 dias).")
     
     params = {
        "latitude": lat,
        "longitude": lon,
        "daily": ",".join([
            "temperature_2m_max",
            "temperature_2m_min",
            "precipitation_sum",
            "precipitation_probability_max",
            "wind_speed_10m_max",
            "wind_gusts_10m_max",
        ]),
        "timezone": "America/Sao_Paulo",
        "start_date": data.isoformat(),
        "end_date": data.isoformat(),
        }
     return {
        "tipo": "previsao",
        "data": data.isoformat(),
        "temp_max": daily["temperature_2m_max"][0],
        "temp_min": daily["temperature_2m_min"][0],
        "chuva_mm": daily["precipitation_sum"][0],
        "chance_chuva": daily["precipitation_probability_max"][0],
        "vento_max": daily["wind_speed_10m_max"][0],
        "rajada_max": daily["wind_gusts_10m_max"][0],
        }




