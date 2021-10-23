import json
import requests


class Nse:
    def __init__(self):
        self.headers = {
            "user-agent": "Chrome/80.0.3987.149 Safari/537.36",
            "accept-language": "en,gu;q=0.9,hi;q=0.8",
            "accept-encoding": "gzip, deflate, br",
        }

        self.option_chain_url = "https://www.nseindia.com/api/option-chain-{}?symbol={}"
        equities_url = "https://www.nseindia.com/api/master-quote"
        self.indices = ["NIFTY", "BANKNIFTY", "FINNIFTY"]
        self.equities=["AARTIIND","ABBOTINDIA","ABFRL","ACC","ADANIENT","ADANIPORTS","ALKEM","AMARAJABAT","AMBUJACEM","APLLTD","APOLLOHOSP","APOLLOTYRE","ASHOKLEY","ASIANPAINT","ASTRAL","AUBANK","AUROPHARMA","AXISBANK","BAJAJ-AUTO","BAJAJFINSV","BAJFINANCE","BALKRISIND","BANDHANBNK","BANKBARODA","BATAINDIA","BEL","BERGEPAINT","BHARATFORG","BHARTIARTL","BHEL","BIOCON","BOSCHLTD","BPCL","BRITANNIA","CADILAHC","CANBK","CANFINHOME","CHOLAFIN","CIPLA","COALINDIA","COFORGE","COLPAL","CONCOR","COROMANDEL","CROMPTON","CUB","CUMMINSIND","DABUR","DALBHARAT","DEEPAKNTR","DELTACORP","DIVISLAB","DIXON","DLF","DRREDDY","EICHERMOT","ESCORTS","EXIDEIND","FEDERALBNK","GAIL","GLENMARK","GMRINFRA","GODREJCP","GODREJPROP","GRANULES","GRASIM","GUJGASLTD","HAL","HAVELLS","HCLTECH","HDFC","HDFCAMC","HDFCBANK","HDFCLIFE","HEROMOTOCO","HINDALCO","HINDPETRO","HINDUNILVR","IBULHSGFIN","ICICIBANK","ICICIGI","ICICIPRULI","IDEA","IDFCFIRSTB","IEX","IGL","INDHOTEL","INDIACEM","INDIAMART","INDIGO","INDUSINDBK","INDUSTOWER","INFY","IOC","IPCALAB","IRCTC","ITC","JINDALSTEL","JKCEMENT","JSWSTEEL","JUBLFOOD","KOTAKBANK","L&TFH","LALPATHLAB","LICHSGFIN","LT","LTI","LTTS","LUPIN","M&M","M&MFIN","MANAPPURAM","MARICO","MARUTI","MCDOWELL-N","MCX","METROPOLIS","MFSL","MGL","MINDTREE","MOTHERSUMI","MPHASIS","MRF","MUTHOOTFIN","NAM-INDIA","NATIONALUM","NAUKRI","NAVINFLUOR","NESTLEIND","NMDC","NTPC","OBEROIRLTY","OFSS","ONGC","PAGEIND","PEL","PERSISTENT","PETRONET","PFC","PFIZER","PIDILITIND","PIIND","PNB","POLYCAB","POWERGRID","PVR","RAMCOCEM","RBLBANK","RECLTD","RELIANCE","SAIL","SBILIFE","SBIN","SHREECEM","SIEMENS","SRF","SRTRANSFIN","STAR","SUNPHARMA","SUNTV","SYNGENE","TATACHEM","TATACONSUM","TATAMOTORS","TATAPOWER","TATASTEEL","TCS","TECHM","TITAN","TORNTPHARM","TORNTPOWER","TRENT","TVSMOTOR","UBL","ULTRACEMCO","UPL","VEDL","VOLTAS","WIPRO","ZEEL"]
        new_nse_url = "https://www.nseindia.com/"
        self.session = requests.Session()
        # self.equities = self.session.get(equities_url, headers=self.headers, timeout=25).json()
        old_nse_url = "https://www1.nseindia.com/"
        sector_url = "https://www1.nseindia.com/live_market/dynaContent/live_watch/stock_watch/{}StockWatch.json"

        request = self.session.get(new_nse_url, headers=self.headers, timeout=25)
        self.cookies = dict(request.cookies)

    async def get_nse_response(self, url, session):
        try:
            async with session.get(
                url=url, headers=self.headers, timeout=25, cookies=self.cookies
            ) as response:
                resp = await response.read()
                return json.loads(resp)
        except Exception as e:
            print("Unable to get url {} due to {}.".format(url, e.__class__))
