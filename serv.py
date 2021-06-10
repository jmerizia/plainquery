from flask import Flask, json, request, jsonify
import sqlite3
from flask_cors import CORS, cross_origin

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'


@app.route('/query', methods=['POST'])
@cross_origin()
def query_route():
    try:
        query = request.json['query']
        params = request.json['params']
        con = sqlite3.connect('file:./Chinook_Sqlite.sqlite?mode=ro', uri=True)
        cur = con.cursor()
        cur.execute(query, params)
        rows = cur.fetchall()
        return jsonify(rows)
    except Exception as e:
        e = str(e)
        return jsonify([[e]]), 400


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)