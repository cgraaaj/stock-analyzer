from flask import Blueprint, request, jsonify
from pandas.core.indexes import base
import requests
from urllib.parse import quote
from flask_jwt_extended import jwt_required

nse = Blueprint("nse", __name__)
option_chain_url = "https://www.nseindia.com/api/option-chain-{}?symbol={}"
equities_url = "https://www.nseindia.com/api/master-quote"
new_nse_url = "https://www.nseindia.com/"
old_nse_url = "https://www1.nseindia.com/"
sector_url = "https://www1.nseindia.com/live_market/dynaContent/live_watch/stock_watch/{}StockWatch.json"


def get_nse_response(baseurl, url):
    headers = {
        "user-agent": "Chrome/80.0.3987.149 Safari/537.36",
        "accept-language": "en,gu;q=0.9,hi;q=0.8",
        "accept-encoding": "gzip, deflate, br",
    }
    session = requests.Session()
    request = session.get(baseurl, headers=headers, timeout=5)
    cookies = dict(request.cookies)
    response = session.get(url, headers=headers, timeout=5, cookies=cookies)
    return response.json()


option_expiry_dates = get_nse_response(
    new_nse_url, option_chain_url.format("equities", "RELIANCE")
)["records"]["expiryDates"]


@nse.route("/option-chain")
@jwt_required()
def get_option_chain():
    index = request.args.get("index")
    symbol = request.args.get("symbol")
    url = option_chain_url.format(index, quote(symbol))
    res = get_nse_response(new_nse_url, url)
    return res


@nse.route("/equities")
@jwt_required()
def get_equities():
    res = get_nse_response(new_nse_url, equities_url)
    return jsonify(res)


@nse.route("/getOptionExpiries")
@jwt_required()
def get_option_expiry():
    return jsonify({"expiryDates": option_expiry_dates})
