from flask import Blueprint, request, jsonify, current_app
from flask.helpers import make_response
from pandas.core.indexes import base
from werkzeug.datastructures import WWWAuthenticate
from werkzeug.security import generate_password_hash, check_password_hash
from urllib.parse import quote
from analyze.get_db import get_database
from functools import wraps
import requests
import uuid
import jwt
import datetime


user = Blueprint("user", __name__)
db = get_database()
collection = db["users"]

def tokenRequired(func):
    @wraps(func)
    def decorated(*args, **kwargs):
        token = None
        if "x-access-token" in request.headers:
            token = request.headers["x-access-token"]
        if not token:
            return jsonify({"message": "Token is missing"}), 401
        try:
            data = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms="HS256")
            current_user = collection.find_one({"username": data["username"]})
        except:
            return jsonify({"message": "Token is invalid!!!"}), 401

        return func(current_user, *args, **kwargs)

    return decorated


@user.route("/getUsers", methods=["GET"])
@tokenRequired
def get_all_users(current_user):
    if not current_user["admin"]:
        return jsonify({"message": "You are not authorized to perform this"})
    users = list(
        collection.find(
            {},
            {
                "_id": 0,
                "public_id": 1,
                "username": 1,
                "password": 1,
                "email": 1,
                "admin": 1,
            },
        )
    )
    current_app.logger.info(users)
    return jsonify({"users": users})


@user.route("/getUser/<public_id>", methods=["GET"])
@tokenRequired
def get_one_user(current_user, public_id):
    if not current_user["admin"]:
        return jsonify({"message": "You are not authorized to perform this"})
    user = collection.find_one(
        {"public_id": public_id},
        {
            "_id": 0,
            "public_id": 1,
            "username": 1,
            "password": 1,
            "email": 1,
            "admin": 1,
        },
    )

    if not user:
        return jsonify({"message": "No user found!"})

    return jsonify({"user": user})


@user.route("/createUser", methods=["POST"])
@tokenRequired
def create_user(current_user):
    if not current_user["admin"]:
        return jsonify({"message": "You are not authorized to perform this"})
    data = request.get_json()
    hased_pass = generate_password_hash(data["password"], method="sha256")
    user = {
        "public_id": str(uuid.uuid4()),
        "username": data["username"],
        "password": hased_pass,
        "email": data["email"],
        "admin": False,
    }
    collection.insert_one(user)
    return jsonify({"message": f"New user, {data['username']} has been created"})


@user.route("/updateUser/<user_id>", methods=["PUT"])
@tokenRequired
def update_user(current_user):
    if not current_user["admin"]:
        return jsonify({"message": "You are not authorized to perform this"})
    return ""


@user.route("/deleteUser/<public_id>", methods=["DELETE"])
@tokenRequired
def delete_user(current_user, public_id):
    if not current_user["admin"]:
        return jsonify({"message": "You are not authorized to perform this"})
    user = collection.find_one(
        {"username": public_id},
        {
            "_id": 0,
            "public_id": 1,
            "username": 1,
            "password": 1,
            "email": 1,
            "admin": 1,
        },
    )

    if not user:
        return jsonify({"message": "No user found!"})
    collection.delete_one({"username": public_id})
    return f"User {public_id} deleted"


@user.route("/login")
def login():
    auth = request.authorization
    if not auth or not auth.username or not auth.password:
        return make_response(
            "Could not verify",
            401,
            {"WWWAuthenticate": 'Basic realm="Login required!"'},
        )
    current_app.logger.info({"auth": auth})
    user = collection.find_one(
        {"username": auth.username},
        {"_id": 0, "username": 1, "password": 1, "email": 1, "admin": 1},
    )
    current_app.logger.info({"user": user})
    if not user:
        return make_response(
            "Could not verify",
            401,
            {"WWWAuthenticate": 'Basic realm="Login required!"'},
        )
    if check_password_hash(user["password"], auth.password):
        token = jwt.encode(
            {
                "username": user["username"],
                "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=30),
            },
            current_app.config["JWT_SECRET_KEY"],
            # SECRET,
            algorithm="HS256",
        )
        return jsonify({"token": token})
    return make_response(
        "Could not verify",
        401,
        {"WWWAuthenticate": 'Basic realm="Login required!"'},
    )
