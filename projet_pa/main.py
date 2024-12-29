from flask import Flask, jsonify, make_response, request, render_template
from flask_mysqldb import MySQL

app = Flask(__name__)

# Configuration MySQL
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'root'
app.config['MYSQL_DB'] = 'db_university'
app.config['MYSQL_HOST'] = 'localhost'

mysql = MySQL(app)

@app.route('/')
def index():
    return render_template('index.html')


@app.route("/etudiants")
def etudiants():
    return render_template("etudiants.html")
@app.route('/api/etudiants', methods=['GET'])
def selectEtudiant():
    conn = mysql.connection
    cursor = conn.cursor()
    
    cursor.execute('SELECT DISTINCT * FROM resultats')

    data = cursor.fetchall()
    row_headers = [x[0] for x in cursor.description]
    cursor.close()

    json_data = []
    for result in data:
        json_data.append(dict(zip(row_headers, result)))
    return make_response(jsonify(json_data), 200)


@app.route('/api/etudiants', methods=['POST'])
def insertEtudiant():


    annee = request.form['annee']
    matricule = request.form['matricule']
    nom = request.form['nom']
    prenom = request.form['prenom']
    sexe  = request.form['sexe']
    specialite = request.form['specialite']
    moyenne = request.form['moyenne']

    conn = mysql.connection
    cursor = conn.cursor()

    req = "INSERT INTO resultats (annee, matricule, nom, prenom, sexe, specialite, moyenne) VALUES (%s, %s, %s, %s, %s, %s, %s)"
    cursor.execute(req, (annee, matricule, nom, prenom, sexe, specialite, moyenne))

    conn.commit()
    cursor.close()

    json_data = [{'id': int(matricule)}]
    return make_response(jsonify(json_data), 201)



if __name__ == '__main__':
    app.run(debug=True)