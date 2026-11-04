from service.route import calcular_rota
from service.geocode import buscar_cidade
class PlanejadorViagem:
    def planejar(self, origem, destino, data):
        ...
            
    def _resolver_cidade(self, texto):
        sugestoes = buscar_cidade(texto)
        if not sugestoes:
            raise ValueError(f"Cidade não encontrada: {texto}")
        return sugestoes[0]
        
    def _calcular_rota(self, origem, destino):
          return calcular_rota(origem, destino)
    
    def _escolher_pontos(self, pontos_rota): ...   
    def _buscar_clima(self, pontos, data): ... 
           
if __name__ == "__main__":
    p = PlanejadorViagem()
    print(p.planejar("Valença Bahia", "Taperoá Bahia", None))