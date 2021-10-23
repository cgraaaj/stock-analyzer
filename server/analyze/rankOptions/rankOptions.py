import sys
import os

from configparser import ConfigParser
from nse.nse import get_nse_response, equities_url, option_chain_url,new_nse_url
from multiprocessing import Pool
import multiprocessing
from itertools import repeat
from analyze.oiAnalyze import analyze_stock
from pprint import pprint
from analyze import get_db
from datetime import datetime
from urllib.parse import quote

class OptionTrend:
    def __init__(self):
        currDir = os.path.dirname(os.path.abspath(__file__))
        self.configFile = os.path.join(currDir, 'config.cfg')
        self.result = multiprocessing.Manager().list()
        self.analyzing = True
        self.config = ConfigParser()
        self.config.read(self.configFile)
        self.session = self.config.get('DEFAULT','sessionCounter')

    def analyze_options_data(self, index, symbol):
        url = option_chain_url.format(index, quote(symbol))
        try:
            temp = {}
            resp = get_nse_response(new_nse_url,url)
            temp["ltp"] = resp["records"]['underlyingValue']
            resp = analyze_stock(resp["records"]["expiryDates"][0], resp["records"])
            # pprint(resp)
            temp["name"] = symbol
            temp["options"] = {
                "calls": {"bullish": 0, "bearish": 0},
                "puts": {"bullish": 0, "bearish": 0},
            }
            temp["options"]["calls"]["bullish"] = len(
                resp[resp["Call Trend"] == "Bullish"]
            )
            temp["options"]["calls"]["bearish"] = len(
                resp[resp["Call Trend"] == "Bearish"]
            )
            temp["options"]["puts"]["bullish"] = len(
                resp[resp["Put Trend"] == "Bullish"]
            )
            temp["options"]["puts"]["bearish"] = len(
                resp[resp["Put Trend"] == "Bearish"]
            )
            temp["callTrend"] = (
                True
                if temp["options"]["calls"]["bullish"]
                > temp["options"]["calls"]["bearish"]
                else False
            )
            temp["putTrend"] = (
                True
                if temp["options"]["puts"]["bullish"]
                > temp["options"]["puts"]["bearish"]
                else False
            )
            self.result.append(temp)
        except Exception as e:
            print(symbol + " " + str(e))
            if "timeout" in str(e):
                print("trying again", symbol)
                self.analyze_options_data(index, symbol)

    def get_option_trend(self, mode):
        tickers = (
            ["NIFTY", "BANKNIFTY", "FINNIFTY"]
            if mode == "indices"
            else get_nse_response(new_nse_url,equities_url)
        )

        pool = Pool(2)
        pool.starmap(self.analyze_options_data, zip(repeat(mode), tickers[:100]))
        pool.close()
        pool.join()
    
    def save(self):
        top5_call = [
            ticker
            for ticker in sorted(
                self.result, key=lambda ticker: ticker["options"]["calls"]["bullish"] - ticker["options"]["calls"]["bearish"], reverse=True
            )
        ][:5]
        top5_put = [
            ticker
            for ticker in sorted(
                self.result, key=lambda ticker: ticker["options"]["puts"]["bullish"] - ticker["options"]["puts"]["bearish"], reverse=True
            )
        ][:5]

        db = get_db.get_database()
        collection = db["rankOptions"]
        date = datetime.today().strftime("%d-%m-%Y")
        res = list(collection.find({"date": date}))

        if not res:
            data = {}
            data["date"] = date
            sessions = []
            sessionData = {}
            sessionData["session"] = self.session
            sessionData["options"] = {"call": top5_call, "put": top5_put}
            sessionData["time"] = datetime.utcnow()
            sessions.append(sessionData)
            data["sessions"] = sessions
            data["last_modified"] = datetime.utcnow()
            collection.insert_one(data)
            
        else:
            currData = res[0]
            sessions = currData["sessions"]
            sessionData = {}
            sessionData["session"] = self.session
            sessionData["options"] = {"call": top5_call, "put": top5_put}
            sessionData["time"] = datetime.utcnow()
            sessions.append(sessionData)
            last_modified= datetime.utcnow()
            collection.update_one({"date": date}, {"$set": {"sessions": sessions,"last_modified": last_modified}})

        self.config.set('DEFAULT', 'sessionCounter', str(int(self.session)+1))
        with open(self.configFile, 'w') as cfg:
            self.config.write(cfg)

    def get_result(self):
        return self.result
