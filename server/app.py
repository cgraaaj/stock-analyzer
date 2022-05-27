# Importing flask module in the project is mandatory
# An object of Flask class is our WSGI application.
from flask import Flask,request
from flask.helpers import make_response
from flask.json import jsonify
from flask_cors import CORS
from waitress import serve
from flask_jwt_extended import JWTManager
import asyncio
import websockets
from analyze.get_db import get_database
import requests
import os
import logging
import csv
import time
from datetime import datetime,timedelta, timezone

# from bson import json_util
from dotenv import load_dotenv
from werkzeug.security import check_password_hash
from nse.nse import nse
from analyze.analyze import analyze,analyze_option_trend
from user.user import user

from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import get_jwt
from flask_jwt_extended import set_access_cookies
from flask_jwt_extended import unset_jwt_cookies



# Flask constructor takes the name of
# current module (__name__) as argument.
app = Flask(__name__)


jwt = JWTManager(app)
app.config["JWT_COOKIE_SECURE"] = False
app.config["JWT_TOKEN_LOCATION"] = ["cookies"]
app.config["JWT_SECRET_KEY"] = "super-dooper-secret"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=3)
app.config['JWT_COOKIE_CSRF_PROTECT'] = False 

app.register_blueprint(nse, url_prefix="/nse")
app.register_blueprint(analyze, url_prefix="/analyze")
app.register_blueprint(user,url_prefix="/user")

# logging
logging.basicConfig(
    filename="server.log",
    level=logging.DEBUG,
    format="%(asctime)s %(levelname)s %(name)s %(threadName)s : %(message)s",
)

# cors
CORS(app)
app.config["CORS_HEADERS"] = "Content-Type"

db = get_database()
collection = db["users"]


@app.after_request
def refresh_expiring_jwts(response):
    try:
        current_user = get_jwt()
        exp_timestamp = current_user["exp"]
        now = datetime.now(timezone.utc)
        target_timestamp = datetime.timestamp(now + timedelta(minutes=30))
        if target_timestamp > exp_timestamp:
            app.logger.info("re setting token")
            access_token = create_access_token(identity=get_jwt_identity(),additional_claims={'is_admin':current_user['is_admin']})
            app.logger.info(access_token)
            set_access_cookies(response, access_token)
        return response
    except (RuntimeError, KeyError):
        # Case where there is not a valid JWT. Just return the original respone
        return response

@app.route("/hi", methods=["GET"])
def hi():
    return "hi"

@app.route('/test.csv')
def generate_large_csv():
    def generate():
        filename = 'test.csv'
        with open(filename, 'r') as csvfile:
            datareader = csv.reader(csvfile)
            for row in datareader:
                time.sleep(1)
                yield f"{','.join(row)}\n"
    return app.response_class(generate(), mimetype='text/csv')

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data or not data['username'] or not data['password']:
        return make_response(
            "Could not verify",
            401,
            {"WWWAuthenticate": 'Basic realm="Login required!"'},
        )
    user = collection.find_one(
        {"username": data['username']},
        {"_id": 0, "public_id": 1, "username": 1, "password": 1, "email": 1, "is_admin": 1},
    )
    if not user:
        return make_response(
            "Could not verify",
            401,
            {"WWWAuthenticate": 'Basic realm="Login required!"'},
        )
    if check_password_hash(user["password"], data['password']):
        access_token = create_access_token(identity=data['username'],additional_claims={'username':data['username'],'is_admin':user['is_admin']})
        response = jsonify({"msg": "login successful","access_token":access_token})
        set_access_cookies(response, access_token)
        return response
    return make_response(
        "Could not verify",
        401,
        {"WWWAuthenticate": 'Basic realm="Login required!"'},
    )

@app.route("/logout", methods=["POST"])
def logout():
    response = jsonify({"msg": "logout successful"})
    unset_jwt_cookies(response)
    return response

# async def analyze_options(websocket:websockets, path):
#     print("hit")
#     now = datetime.now()
#     minutes = 5
#     start = now.replace(hour=9,minute=15)
#     end = now.replace(hour=15,minute=30)
#     while now>start and now<end:
#         result = analyze_option_trend()
#         await websocket.send(result)
#         await asyncio.sleep(minutes*60)
#     await websocket.send("asdf")


# main driver function
if __name__ == "__main__":

    LOCATE_PY_DIRECTORY_PATH = os.path.abspath(os.path.dirname(__file__))
    load_dotenv("{}/.env".format(LOCATE_PY_DIRECTORY_PATH))
    # run() method of Flask class runs the application
    # on the local development server.
    port= 5000
    ws_port = 5123
    ws_host = '0.0.0.0'

    # loop = asyncio.new_event_loop()
    # asyncio.set_event_loop(loop)
    # start_server = websockets.serve(analyze_options, ws_host, ws_port)
    # print(f"Server Starting at {ws_host} {ws_port}")

    if os.getenv("FLASK_ENV") == "development":
        app.run(port=port, host="0.0.0.0", debug=True)
    else:
        serve(app, host="0.0.0.0", port=port)

    # asyncio.get_event_loop().run_until_complete(start_server)
    # asyncio.get_event_loop().run_forever()
