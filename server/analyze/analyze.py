from flask import Blueprint,request,jsonify,current_app, send_from_directory,after_this_request,jsonify
import os
import pymongo
import json

from analyze.oiAnalyze import analyze_stock
from analyze.get_db import get_database

analyze = Blueprint("analyze", __name__)
db = get_database()

@analyze.route('/option-chain', methods = ['POST'])
def option_chain():
    expiry = request.args.get('expiry')
    current_app.logger.info(f'analyzing data')
    df = analyze_stock(expiry,request.json)
    return df.to_json()


@analyze.route('/download/<path:index>', methods=['POST'])
def download(index):
    expiry = request.args.get('expiry')
    df = analyze_stock(expiry,request.json)
    df.to_excel(f'{analyze.root_path}/data/{index}.xlsx')
    file_path = os.path.join(analyze.root_path, 'data', f'{index}.xlsx')
    @after_this_request
    def remove_file(res):
        if os.path.isfile(file_path):
            current_app.logger.info(f'deleting file {file_path}')
            os.remove(file_path)
        return res
    print(os.path.dirname(file_path),file_path)
    return send_from_directory(os.path.dirname(file_path),file_path, f'{index}.xlsx')

@analyze.route('/uptrend', methods=['GET'])
def get_uptrend():
    current_app.logger.info(f'fetching data')
    collection = db["uptrend"]
    res = list(collection.find({},{ "_id": 0, "date": 1, "nifty": 1, "non_nifty":1},limit=7,sort=[('_id', pymongo.DESCENDING)]))
    current_app.logger.info(res)
    return jsonify(res)
    # return json.dumps(res)
