import asyncio
import logging
from datetime import datetime
import websockets
import json
import timeit
from analyze.optionTrend import OptionTrend
import pathlib

cwd = pathlib.Path(__file__).parent.resolve()

logging.basicConfig(filename=f'{cwd}/ws.log',
                            filemode='a',
                            format='%(asctime)s,%(msecs)d %(name)s %(levelname)s %(message)s',
                            datefmt='%H:%M:%S',
                            level=logging.INFO)


class OptionTrendTimer:
    def __init__(self, ws):
        self.ws = ws
        self.start = datetime.now().replace(hour=9, minute=15)
        self.end = datetime.now().replace(hour=15, minute=30)

    async def get_option_trend(self, ot):
        minutes = 5
        while True:
            while datetime.now() > self.start and datetime.now()< self.end:
                logging.info(f"Starting Trend analysis")
                before = timeit.default_timer()
                result = await ot.get_option_trend("equities")
                after = timeit.default_timer()
                trend_data = {
                    "event": "TREND",
                    "data": result,
                    "last_updated": str(datetime.now().strftime("%H:%M:%S")),
                    "time_taken": str(round((after - before), 2)),
                }
                await self.ws.send_to_clients("trend", json.dumps(trend_data))
                ot.save_to_db()
                ot.clear_option_trend()
                ot.result['options_trend'] = trend_data
                self.ws.set_last_updated(ot.get_result())
                await asyncio.sleep(minutes * 60)
            await asyncio.sleep((self.start-datetime.now()).total_seconds())

    async def get_option_rank(self, ot):
        minutes = 5
        while True:
            while datetime.now()> self.start and datetime.now()< self.end:
                await asyncio.sleep(40)
                logging.info(f"Starting Rank analysis")
                result = await ot.get_option_rank()
                rank_data = {"data": result, "event": "RANK"}
                await self.ws.send_to_clients(
                    "rank", json.dumps(rank_data)
                )
                ot.result['options_rank'] = rank_data
                self.ws.set_last_updated(ot.get_result())
                await asyncio.sleep((minutes * 60)-40)
            await asyncio.sleep((self.start-datetime.now()).total_seconds())


class WebsocketServer:
    def __init__(self):
        self.clients = set()
        self.data = dict()
        self.ot = OptionTrend()
        self.ott = OptionTrendTimer(self)
        self.last_updated = {}

    def set_last_updated(self, last_updated):
        self.last_updated = last_updated

    async def start_analyzing(self):
        logging.info(f"Analyzing options.")
        asyncio.get_event_loop().create_task(self.ott.get_option_trend(self.ot))
        asyncio.get_event_loop().create_task(self.ott.get_option_rank(self.ot))

    async def register(self, ws) -> None:
        self.clients.add(ws)
        logging.info(f"{ws.remote_address} connects.")
        await ws.send(json.dumps(self.last_updated))

    async def unregister(self, ws) -> None:
        self.clients.remove(ws)
        logging.info(f"{ws.remote_address} disconnects.")

    async def send_to_clients(self, action: str, message: str) -> None:
        logging.info(f"sending {action} results")
        if self.clients:
            await asyncio.wait([client.send(message) for client in self.clients])

    async def ws_handler(self, ws, uri: str) -> None:
        await self.register(ws)
        try:
            await self.distribute(ws)
        finally:
            await self.unregister(ws)

    async def distribute(self, ws) -> None:
        async for message in ws:
            await self.send_to_clients(message)


if __name__ == "__main__":
    ws = WebsocketServer()
    start_server = websockets.serve(ws.ws_handler, "0.0.0.0", 3213)
    print("Started")
    asyncio.get_event_loop().create_task(ws.start_analyzing())
    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_forever()
