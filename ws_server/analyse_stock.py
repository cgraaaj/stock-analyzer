import math
import multiprocessing
import os

from configparser import ConfigParser
from itertools import repeat
from multiprocessing import Pool
from urllib.parse import quote
from nse.nse import Nse
from oi_analyse import analyze_stock
import time
import asyncio
import aiohttp


class OptionTrend:
    def __init__(self):
        currDir = os.path.dirname(os.path.abspath(__file__))
        self.configFile = os.path.join(currDir, "config.cfg")
        self.stockOptions = multiprocessing.Manager().list()
        self.result = {"optionsTrend": [], "optionsRank": {}}
        self.analyzing = True
        self.config = ConfigParser()
        self.config.read(self.configFile)
        self.nse = Nse()
        # self.db = get_database()

    def analyze_options_data(self, resp, symbol):

        try:

            resp = analyze_stock(resp["records"]["expiryDates"][0], resp["records"])
            # pprint(resp)
            temp = {}
            temp["name"] = symbol
            temp["options"] = {}

            def group_result(resp, _type="calls", result={}):
                result["options"][_type] = {
                    "bullish": 0,
                    "bearish": 0,
                    "percentage": 0,
                    "grade": "",
                }

                result["options"][_type]["bullish"] = len(
                    resp[resp["Call Trend"] == "Bullish"]
                )

                result["options"][_type]["bearish"] = len(
                    resp[resp["Call Trend"] == "Bearish"]
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
            self.stockOptions.append(temp)
        except Exception as e:
            print(symbol + " " + str(e))
            if "timeout" in str(e):
                print("trying again", symbol)

    async def main(self, urls):
        async with aiohttp.ClientSession() as session:
            ret = await asyncio.gather(
                *[self.nse.get_nse_response(url, session) for url in urls]
            )
            return ret

    def get_option_trend(self, mode):
        tickers = (
            ["NIFTY", "BANKNIFTY", "FINNIFTY"]
            if mode == "indices"
            else self.nse.get_nse_response(self.nse.equities_url)
        )
        urls = []
        for ticker in tickers:
            url = self.nse.option_chain_url.format(mode, quote(ticker))
            urls.append(url)
        print(urls)
        result = asyncio.get_event_loop().run_until_complete(self.main(urls))
        for i, r in enumerate(result):
            self.analyze_options_data(r, tickers[i])
        # pool = Pool(1)
        # pool.starmap(self.analyze_options_data, zip(repeat(mode), tickers))
        # pool.close()
        # pool.join()
        # self.result["optionsTrend"] = list(self.stockOptions)


if __name__ == "__main__":
    start = time.time()
    OptionTrend().get_option_trend("indices")
    end = time.time()
    print("Took {} seconds to pull websites.".format(end - start))
