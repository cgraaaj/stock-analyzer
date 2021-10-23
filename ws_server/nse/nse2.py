import requests

option_chain_url = "https://www.nseindia.com/api/option-chain-{}?symbol={}"
equities_url = "https://www.nseindia.com/api/master-quote"
new_nse_url = "https://www.nseindia.com/"
old_nse_url = "https://www1.nseindia.com/"
sector_url= "https://www1.nseindia.com/live_market/dynaContent/live_watch/stock_watch/{}StockWatch.json"

class Nse:
    def __init__(self):
        self.headers = {
        "user-agent": "Chrome/80.0.3987.149 Safari/537.36",
        "accept-language": "en,gu;q=0.9,hi;q=0.8",
        "accept-encoding": "gzip, deflate, br",
        }
        self.session = requests.Session()
        request = self.session.get(new_nse_url, headers=self.headers, timeout=25)
        self.cookies = dict(request.cookies)

    def get_nse_response(self,url):
        response = self.session.get(url, headers=self.headers, timeout=25, cookies=self.cookies)
        return response.json()
