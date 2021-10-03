from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash
from analyze.get_db import get_database
import uuid
from flask_jwt_extended import jwt_required
from flask_jwt_extended import get_jwt

user = Blueprint("user", __name__)
db = get_database()
collection = db["users"]



@user.route("/getUsers", methods=["GET"])
@jwt_required()
def get_all_users():
    current_user = get_jwt()
    if not current_user["is_admin"]:
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
                "is_admin": 1,
            },
        )
    )
    current_app.logger.info(users)
    return jsonify({"users": users})

@user.route("/getUser/<public_id>", methods=["GET"])
@jwt_required()
def get_one_user(public_id):
    current_user = get_jwt()
    if not current_user["is_admin"]:
        return jsonify({"message": "You are not authorized to perform this"})
    user = collection.find_one(
        {"public_id": public_id},
        {
            "_id": 0,
            "public_id": 1,
            "username": 1,
            "password": 1,
            "email": 1,
            "is_admin": 1,
        },
    )

    if not user:
        return jsonify({"message": "No user found!"})

    return jsonify({"user": user})


@user.route("/createUser", methods=["POST"])
@jwt_required()
def create_user():
    current_user = get_jwt()
    if not current_user["is_admin"]:
        return jsonify({"message": "You are not authorized to perform this"})
    data = request.get_json()
    hased_pass = generate_password_hash(data["password"], method="sha256")
    user = {
        "public_id": str(uuid.uuid4()),
        "username": data["username"],
        "password": hased_pass,
        "email": data["email"],
        "is_admin": False,
    }
    collection.insert_one(user)
    return jsonify({"message": f"New user, {data['username']} has been created"})


@user.route("/updateUser/<user_id>", methods=["PUT"])
@jwt_required()
def update_user():
    current_user = get_jwt()
    if not current_user["is_admin"]:
        return jsonify({"message": "You are not authorized to perform this"})
    return ""


@user.route("/deleteUser/<public_id>", methods=["DELETE"])
@jwt_required()
def delete_user(public_id):
    current_user = get_jwt()
    if not current_user["is_admin"]:
        return jsonify({"message": "You are not authorized to perform this"})
    user = collection.find_one(
        {"public_id": public_id},
        {
            "_id": 0,
            "public_id": 1,
            "username": 1,
            "password": 1,
            "email": 1,
            "is_admin": 1,
        },
    )

    if not user:
        return jsonify({"message": "No user found!"})
    collection.delete_one({"username": public_id})
    return f"User {public_id} deleted"
