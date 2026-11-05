from service.route import calcular_rota
from service.geocode import buscar_cidade
class PlanejadorViagem:
    def planejar(self, origem, destino, data):
        #metodos de uso interno á classe
        self._validar_ponto(origem)
        self._validar_ponto(destino)

        rota = self._calcular_rota(origem, destino)

        return {
        "origem": origem,
        "destino": destino,
        "distancia_km": rota["distancia_km"],
        "duracao_min": rota["duracao_min"],
        "pontos_rota": rota["pontos"],
        "clima": [],   # entra quando a função de clima existir
    }
        
            
    def _resolver_cidade(self, texto):
        sugestoes = buscar_cidade(texto)
        if not sugestoes:
            raise ValueError(f"Cidade não encontrada: {texto}")
        return sugestoes[0]
        
    def _calcular_rota(self, origem, destino):
          return calcular_rota(origem, destino)
    
    def _validar_pontos(self, ponto):
        try:
            let = float(ponto["lat"])
            lon = float(ponto["lon"])
        except (KeyError, TypeError, ValueError):
            raise ValueError("Coordenadas estão erradas")
        if not (-90 <= lat <= 90 and -180 <= lon <= 180):
            raise ValueError("Coordenadas fora do intervalo válido.")

        
    def _escolher_pontos(self, pontos_rota): ...   
    def _buscar_clima(self, pontos, data): ... 
      