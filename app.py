from flask import Flask, request, jsonify, render_template
import sqlite3

app = Flask(
    __name__, template_folder="templates"
)  # Asegúrate de tener una carpeta "templates"
data_Base = "./db/creditos.db"


def get_db():
    conn = sqlite3.connect(data_Base)
    conn.row_factory = sqlite3.Row
    return conn


@app.route("/", methods=["GET"])
def index():
    # Renderizar el archivo HTML
    return render_template("index.html")


@app.route("/creditos", methods=["GET"])
def read_credits():
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM creditos")
    rows = cursor.fetchall()
    return jsonify([dict(row) for row in rows])


@app.route("/creditos", methods=["POST"])
def create_credit():
    data = request.json
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "INSERT INTO creditos (cliente, monto, tasa_Interes, plazo, fecha_Otorgamiento) "
        "VALUES (?, ?, ?, ?, ?)",
        (
            data["cliente"],
            data["monto"],
            data["tasa_Interes"],
            data["plazo"],
            data["fecha_Otorgamiento"],
        ),
    )
    db.commit()
    return jsonify({"message": "Crédito registrado exitosamente"}), 201


@app.route("/creditos/<int:id>", methods=["PUT"])
def update_credit(id):
    data = request.json
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "UPDATE creditos SET cliente = ?, monto = ?, tasa_Interes = ?, plazo = ?, "
        "fecha_Otorgamiento = ? WHERE id = ?",
        (
            data["cliente"],
            data["monto"],
            data["tasa_Interes"],
            data["plazo"],
            data["fecha_Otorgamiento"],
            id,
        ),
    )
    db.commit()
    return jsonify({"message": "Crédito actualizado exitosamente"})


@app.route("/creditos/<int:id>", methods=["DELETE"])
def delete_credit(id):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("DELETE FROM creditos WHERE id = ?", (id,))
    db.commit()
    return jsonify({"message": "Crédito eliminado exitosamente"})


if __name__ == "__main__":
    app.run(debug=True)
