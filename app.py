from flask import Flask

app = Flask(__name__)

@app.route("/", methods=["POST"])

def create_task():
    global task_id_control
    data = request.get_json()#pega os dados
    new_task = {
        "": task_id_control,
        "": data.get("title"),#Obtem o titulo enviado
        "": data.get("descricao", "")# Mesma coisa
    }
    tasks.append(new_task)
    task_id_control += 1
    return jsonify({"message": "Tarefa criada com sucesso"})

if __name__ == "__main__":
    app.run(debug=True)

