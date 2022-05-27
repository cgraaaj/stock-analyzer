import sys

sys.path.append("/home/pudge/Docker/gitlab/stock-analyzer/server/analyze")
from flask import (
    Blueprint,
    request,
    jsonify,
    current_app,
    send_from_directory,
    after_this_request,
    stream_with_context,
    Response,
)

import os
import pymongo
import json
import time
import math
import pandas as pd

# from rankOptions import analyze_options_data
from analyze.oiAnalyze import analyze_stock
from analyze.get_db import get_database
from analyze.rankOptions import rankOptions
from nse.nse import get_nse_response
from nse import nse
from urllib.parse import quote
from flask_jwt_extended import jwt_required

analyze = Blueprint("analyze", __name__)
db = get_database()
currpath = os.path.dirname(os.path.abspath(__file__))

nifty_auto = [
    stock["symbol"]
    for stock in nse.get_nse_response(
        nse.new_nse_url, nse.sector_url.format("cnxAuto")
    )["data"]
]
nifty_bank = [
    stock["symbol"]
    for stock in nse.get_nse_response(
        nse.new_nse_url, nse.sector_url.format("bankNifty")
    )["data"]
]
nifty_energy = [
    stock["symbol"]
    for stock in nse.get_nse_response(
        nse.new_nse_url, nse.sector_url.format("cnxEnergy")
    )["data"]
]
nifty_finance = [
    stock["symbol"]
    for stock in nse.get_nse_response(
        nse.new_nse_url, nse.sector_url.format("cnxFinance")
    )["data"]
]
nifty_fmcg = [
    stock["symbol"]
    for stock in nse.get_nse_response(
        nse.new_nse_url, nse.sector_url.format("cnxFMCG")
    )["data"]
]
nifty_it = [
    stock["symbol"]
    for stock in nse.get_nse_response(nse.new_nse_url, nse.sector_url.format("cnxit"))[
        "data"
    ]
]
nifty_media = [
    stock["symbol"]
    for stock in nse.get_nse_response(
        nse.new_nse_url, nse.sector_url.format("cnxMedia")
    )["data"]
]
nifty_metal = [
    stock["symbol"]
    for stock in nse.get_nse_response(
        nse.new_nse_url, nse.sector_url.format("cnxMetal")
    )["data"]
]
nifty_pharma = [
    stock["symbol"]
    for stock in nse.get_nse_response(
        nse.new_nse_url, nse.sector_url.format("cnxPharma")
    )["data"]
]
nifty_psu = [
    stock["symbol"]
    for stock in nse.get_nse_response(nse.new_nse_url, nse.sector_url.format("cnxPSU"))[
        "data"
    ]
]
nifty_realty = [
    stock["symbol"]
    for stock in nse.get_nse_response(
        nse.new_nse_url, nse.sector_url.format("cnxRealty")
    )["data"]
]
nifty_pvt_bank = [
    stock["symbol"]
    for stock in nse.get_nse_response(
        nse.new_nse_url, nse.sector_url.format("niftyPvtBank")
    )["data"]
]

sectors = [
    {"label": "Nifty Auto", "value": nifty_auto},
    {"label": "Nifty Bank", "value": nifty_bank},
    {"label": "Nifty Energy", "value": nifty_energy},
    {"label": "Nifty Financial Services", "value": nifty_finance},
    {"label": "Nifty FMCG", "value": nifty_fmcg},
    {"label": "Nifty IT", "value": nifty_it},
    {"label": "Nifty Media", "value": nifty_media},
    {"label": "Nifty Metal", "value": nifty_metal},
    {"label": "Nifty Pharma", "value": nifty_pharma},
    {"label": "Nifty PSU Bank", "value": nifty_psu},
    {"label": "Nifty Realty", "value": nifty_realty},
    {"label": "Nifty Private Bank", "value": nifty_pvt_bank},
    {"label": "", "value": []},
]


@analyze.route("/option-chain", methods=["POST"])
@jwt_required()
def option_chain():
    print(request.args.get("expiry"))
    expiry = request.args.get("expiry")
    current_app.logger.info(f"analyzing data")
    df = analyze_stock(expiry, request.json)
    return df.to_json(orient="records")


@analyze.route("/download/<path:index>", methods=["POST"])
@jwt_required()
def download(index):
    expiry = request.args.get("expiry")
    df = analyze_stock(expiry, request.json)
    df.to_excel(f"{analyze.root_path}/data/{index}.xlsx")
    file_path = os.path.join(analyze.root_path, "data", f"{index}.xlsx")

    @after_this_request
    def remove_file(res):
        if os.path.isfile(file_path):
            current_app.logger.info(f"deleting file {file_path}")
            os.remove(file_path)
        return res

    print(os.path.dirname(file_path), file_path)
    return send_from_directory(os.path.dirname(file_path), file_path, f"{index}.xlsx")


@analyze.route("/uptrend", methods=["GET"])
@jwt_required()
def get_uptrend():
    current_app.logger.info(f"fetching data")
    collection = db["uptrend"]
    res = list(
        collection.find(
            {},
            {"_id": 0, "date": 1, "nifty": 1, "non_nifty": 1},
            limit=7,
            sort=[("_id", pymongo.DESCENDING)],
        )
    )
    current_app.logger.info(res)
    return jsonify(res)
    # return json.dumps(res)


@analyze.route("/getContentLength", methods=["GET"])
@jwt_required()
def get_content_length():
    current_app.logger.info(f"content length")
    return "37000"


@analyze.route("/options", methods=["GET"])
@jwt_required()
def get_options():
    expiry = request.args.get("expiry")
    current_app.logger.info(f"analyzing data")
    mode = "equities"
    tickers = (
        ["NIFTY", "BANKNIFTY", "FINNIFTY"]
        if mode == "indices"
        else get_nse_response(nse.new_nse_url, nse.equities_url)
    )

    def generate():
        # for ticker in tickers[:10]:
        for ticker in tickers:
            yield json.dumps(analyze_options_data(mode, ticker, expiry)) + "\n"

    # response.headers.add('content-length',26000)
    return current_app.response_class(generate(), mimetype="application/json")
    # return current_app.response_class(stream_with_context(generate()))


@analyze.route("/getOptionRank", methods=["GET"])
@jwt_required()
def get_option_rank():
    sessions = {"5min": [], "15min": [], "30min": [], "60min": []}
    current_app.logger.info(f"fetching data")
    collection = db["rankOptions"]
    res = list(
        collection.find(
            {},
            {"_id": 0, "date": 1, "sessions": 1},
            limit=1,
            sort=[("_id", pymongo.DESCENDING)],
        )
    )[0]
    # sessions['5min'] = res['sessions']
    # sessions['15min'] = res['sessions'][3:len(res['sessions']):3]
    # sessions['30min'] = res['sessions'][6:len(res['sessions']):6]
    # sessions['60min'] = res['sessions'][6:len(res['sessions']):12]
    sessions["5min"] = []
    sessions["15min"] = []
    sessions["30min"] = res["sessions"]
    sessions["60min"] = res["sessions"][1 : len(res["sessions"]) : 2]
    # current_app.logger.info(sessions)
    return jsonify({"date": res["date"], "sessions": sessions})


@analyze.route("/getSectors", methods=["GET"])
@jwt_required()
def get_sectors():
    return {"sectors": sectors}


def analyze_options_data(index, symbol, expiry):
    url = nse.option_chain_url.format(index, quote(symbol))
    resp = {}
    try:
        resp = get_nse_response(nse.new_nse_url, url)
        resp = analyze_stock(expiry, resp["records"])
        # pprint(resp)
        temp = {}
        temp["name"] = symbol
        temp["options"] = {
            "calls": {"bullish": 0, "bearish": 0, "percentage": 0, "grade": ""},
            "puts": {"bullish": 0, "bearish": 0, "percentage": 0, "grade": ""},
        }

        temp["options"]["calls"]["bullish"] = len(resp[resp["Call Trend"] == "Bullish"])
        temp["options"]["calls"]["bearish"] = len(resp[resp["Call Trend"] == "Bearish"])
        if temp["options"]["calls"]["bullish"] == 0:
            temp["options"]["calls"]["percentage"] = 0
        else:
            temp["options"]["calls"]["percentage"] = math.ceil(
                (
                    (
                        temp["options"]["calls"]["bullish"]
                        - temp["options"]["calls"]["bearish"]
                    )
                    / temp["options"]["calls"]["bullish"]
                )
                * 100
            )
        if temp["options"]["calls"]["percentage"] == 100:
            temp["options"]["calls"]["grade"] = "A"
        elif (
            temp["options"]["calls"]["percentage"] > 85
            and temp["options"]["calls"]["percentage"] < 100
        ):
            temp["options"]["calls"]["grade"] = "B"
        elif (
            temp["options"]["calls"]["percentage"] > 50
            and temp["options"]["calls"]["percentage"] <= 85
        ):
            temp["options"]["calls"]["grade"] = "C"
        else:
            temp["options"]["calls"]["grade"] = "D"

        temp["options"]["puts"]["bullish"] = len(resp[resp["Put Trend"] == "Bullish"])
        temp["options"]["puts"]["bearish"] = len(resp[resp["Put Trend"] == "Bearish"])
        if temp["options"]["puts"]["bullish"] == 0:
            temp["options"]["puts"]["percentage"] = 0
        else:
            temp["options"]["puts"]["percentage"] = math.ceil(
                (
                    (
                        temp["options"]["puts"]["bullish"]
                        - temp["options"]["puts"]["bearish"]
                    )
                    / temp["options"]["puts"]["bullish"]
                )
                * 100
            )
        if temp["options"]["puts"]["percentage"] == 100:
            temp["options"]["puts"]["grade"] = "A"
        elif (
            temp["options"]["puts"]["percentage"] > 85
            and temp["options"]["puts"]["percentage"] < 100
        ):
            temp["options"]["puts"]["grade"] = "B"
        elif (
            temp["options"]["puts"]["percentage"] > 50
            and temp["options"]["puts"]["percentage"] <= 85
        ):
            temp["options"]["puts"]["grade"] = "C"
        else:
            temp["options"]["puts"]["grade"] = "D"

        temp["callTrend"] = (
            True
            if temp["options"]["calls"]["bullish"] > temp["options"]["calls"]["bearish"]
            else False
        )
        temp["putTrend"] = (
            True
            if temp["options"]["puts"]["bullish"] > temp["options"]["puts"]["bearish"]
            else False
        )
        return temp
    except Exception as e:
        # current_app.logger.info(symbol)
        print(f"got Exception {e} on {symbol}")


def analyze_option_trend():
    optionTrend = rankOptions.OptionTrend()
    optionTrend.get_option_trend("equities")
    optionTrend.save()
    return optionTrend.get_result()
