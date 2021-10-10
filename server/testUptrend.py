import sys

sys.path.append("/home/pudge/Docker/gitlab/stock-analyzer/server/nse")

from nse.nse import get_nse_response
from multiprocessing import Pool
import multiprocessing
from itertools import repeat
from analyze.oiAnalyze import analyze_stock
from pprint import pprint

class OptionTrend:
    def __init__(self):
        self.option_chain_url = "https://www.nseindia.com/api/option-chain-{}?symbol={}"
        self.equities_url = "https://www.nseindia.com/api/master-quote"
        self.result = multiprocessing.Manager().list()

    def analyze_options_data(self,index, symbol):
        url = self.option_chain_url.format(index, symbol)
        try:
            resp= get_nse_response(url)
            resp = analyze_stock(resp['records']['expiryDates'][0],resp['records'])
            # pprint(resp)
            temp={}
            temp['name']= symbol
            temp['options']={"calls":{"bullish":0,"bearish":0},"puts":{"bullish":0,"bearish":0}}
            temp['options']['calls']['bullish'] = len(resp[resp['Call Trend'] == "Bullish"])
            temp['options']['calls']['bearish'] = len(resp[resp['Call Trend'] == "Bearish"])
            temp['options']['puts']['bullish'] = len(resp[resp['Put Trend'] == "Bullish"])
            temp['options']['puts']['bearish'] = len(resp[resp['Put Trend'] == "Bearish"])
            temp['callTrend'] = True if temp['options']['calls']['bullish'] > temp['options']['calls']['bearish'] else False
            temp['putTrend'] = True if temp['options']['puts']['bullish'] > temp['options']['puts']['bearish'] else False
            self.result.append(temp)
        except:
            print(symbol)


    def get_option_trend(self,mode):
        tickers = ['NIFTY','BANKNIFTY','FINNIFTY'] if mode == "indices" else get_nse_response(self.equities_url)
        # for ticker in tickers:
        #     analyze_options_data(mode, ticker)
        pool = Pool(2)
        pool.starmap(self.analyze_options_data, zip(repeat(mode),tickers))
        # pool.starmap(func, [(1, 1), (2, 1), (3, 1)])
        # pool.starmap(func, zip(a_args, repeat(second_arg)))
        # pool.map(partial(func, b=second_arg), a_args)
        # print(self.result)
        # print([ticker['name'] for ticker in self.result if ticker['callTrend']])
        # print([ticker['name'] for ticker in self.result if ticker['putTrend']])
        return self.result

# get_option_trend("equities")

# print ([ticker['name'] for ticker in sorted(result, key = lambda ticker: ticker['options']['calls']['bullish'],reverse=True)])
# print ([ticker['name'] for ticker in sorted(result, key = lambda ticker: ticker['options']['puts']['bullish'],reverse=True)])
