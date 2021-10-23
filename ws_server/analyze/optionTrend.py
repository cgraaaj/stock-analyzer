import json
import sys
import os

from configparser import ConfigParser
from multiprocessing import Pool
import multiprocessing
from itertools import repeat
import asyncio
from multiprocessing import Process
import aiohttp

from flask.json import jsonify
from analyze.oiAnalyze import analyze_stock
from pprint import pprint
from datetime import datetime
from urllib.parse import quote
import pandas as pd
import math
# from rankOptions import analyze_options_data
from analyze.oiAnalyze import analyze_stock
from analyze.getDB import get_database
from nse.nse import Nse
from nse import nse
from urllib.parse import quote
import pymongo

class OptionTrend:
    def __init__(self):
        currDir = os.path.dirname(os.path.abspath(__file__))
        self.configFile = os.path.join(currDir, 'config.cfg')
        self.stockOptions=[]
        self.result = {'options_trend':[],'options_rank':{}}
        self.nse = Nse()
        self.db = get_database()
        self.session= 1


    def analyze_options_data(self,resp, symbol):
        try:
            resp = analyze_stock(resp["records"]["expiryDates"][0], resp["records"])
            # pprint(resp)
            temp = {}
            temp["name"] = symbol
            temp["options"] = {}

            def group_result(resp, _type="calls", result={}):
                _trend = "Call" if _type == "calls" else "Put"
                result["options"][_type] = {
                    "bullish": 0,
                    "bearish": 0,
                    "percentage": 0,
                    "grade": "",
                }

                result["options"][_type]["bullish"] = len(
                    resp[resp[f"{_trend} Trend"] == "Bullish"]
                )

                result["options"][_type]["bearish"] = len(
                    resp[resp[f"{_trend} Trend"] == "Bearish"]
                )
                if result["options"][_type]["bullish"]==0:
                    result["options"][_type]["percentage"]=0
                else:
                    result["options"][_type]["percentage"] = (
                    (
                        result["options"][_type]["bullish"]
                        - result["options"][_type]["bearish"]
                    )
                    / result["options"][_type]["bullish"]
                ) * 100

                if result["options"][_type]["percentage"] == 100:
                    result["options"][_type]["grade"] = "A"
                elif (
                    result["options"][_type]["percentage"] > 85
                    and result["options"][_type]["percentage"] < 100
                ):
                    result["options"][_type]["grade"] = "B"
                elif (
                    result["options"][_type]["percentage"] > 50
                    and result["options"]["calls"]["percentage"] <= 85
                ):
                    result["options"][_type]["grade"] = "C"
                else:
                    result["options"][_type]["grade"] = "D"
                return result

            group_result(resp, "calls", temp)

            group_result(resp, "puts", temp)

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
            self.stockOptions.append(temp)
        except Exception as e:
            print(symbol + " " + str(e))
            if "timeout" in str(e):
                print("trying again", symbol)
                self.analyze_options_data(resp, symbol)

    async def main(self, urls):
        async with aiohttp.ClientSession() as session:
            ret = await asyncio.gather(
                *[self.nse.get_nse_response(url, session) for url in urls]
            )
            return ret

    async def get_option_trend(self, mode):
        tickers = (
            self.nse.indices
            if mode == "indices"
            else self.nse.equities
        )
        urls = []
        for ticker in tickers:
            url = self.nse.option_chain_url.format(mode, quote(ticker))
            urls.append(url)
        result = await self.main(urls)
        for i, r in enumerate(result):
            self.analyze_options_data(r, tickers[i])
        # self.result['options_trend'] = self.stockOptions
        return self.stockOptions
    
    def clear_option_trend(self):
        self.stockOptions = []
    
    def save_to_db(self):
        top5_call = [
            ticker
            for ticker in sorted(
                self.stockOptions, key=lambda ticker: ticker["options"]["calls"]["bullish"] - ticker["options"]["calls"]["bearish"], reverse=True
            )
        ][:5]
        top5_put = [
            ticker
            for ticker in sorted(
                self.stockOptions, key=lambda ticker: ticker["options"]["puts"]["bullish"] - ticker["options"]["puts"]["bearish"], reverse=True
            )
        ][:5]

        db = self.db
        collection = db["rankOptions"]
        date = datetime.today().strftime("%d-%m-%Y")
        res = list(collection.find({"date": date}))

        if not res:
            data = {}
            data["date"] = date
            sessions = []
            sessionData = {}
            sessionData["session"] = str(self.session)
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
            sessionData["session"] = str(self.session)
            sessionData["options"] = {"call": top5_call, "put": top5_put}
            sessionData["time"] = datetime.utcnow()
            sessions.append(sessionData)
            last_modified= datetime.utcnow()
            collection.update_one({"date": date}, {"$set": {"sessions": sessions,"last_modified": last_modified}})
         
        self.session += 1
    
    async def get_option_rank(self):
        sessions={'5min':[],'15min':[],'30min':[],'60min':[]}
        db= self.db
        collection = db["rankOptions"]
        res = list(
            collection.find(
                {},
                {"_id": 0, "date": 1, "sessions": 1},
                limit=1,
                sort=[("_id", pymongo.DESCENDING)],
            )
        )[0]
        sessions['5min'] = res['sessions']
        sessions['15min'] = res['sessions'][3:len(res['sessions']):3]
        sessions['30min'] = res['sessions'][6:len(res['sessions']):6]
        sessions['60min'] = res['sessions'][6:len(res['sessions']):12]
        # sessions['5min'] = []
        # sessions['15min'] = []
        # sessions['30min'] = res['sessions']
        # sessions['60min'] = res['sessions'][1:len(res['sessions']):2]
        # current_app.logger.info(sessions)
        rankData = json.dumps({"date":res['date'],"sessions":sessions},default=str)
        # self.result['options_rank'] = rankData
        return rankData

    def get_result(self):
        return self.result
