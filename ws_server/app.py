import asyncio
from datetime import datetime
import random
from eventlet.patcher import monkey_patch
from flask import json, jsonify,request
import websockets
import time
from analyze.analyze import analyze_option_trend
from analyze.getDB import get_database
import pymongo
import timeit
import math
import sys

import time



last_updated = {}

clients = []
async def hello(websocket, path):
    service = None
    while True:
        try:
            await websocket.send("hello")
            clients.append(websocket)
            # while True:
            #     pass
        except websockets.ConnectionClosed:
            print(f"Terminated")
            break
        except Exception as e:
            raise e

def set_last_updated(option_data):
    global last_updated
    last_updated = option_data
    return None


def get_last_updated():
    return last_updated


def analyze_options():
    print("analyzning")
    connected_time_minute = int(datetime.now().strftime("%M"))
    before = timeit.default_timer()
    result = analyze_option_trend()
    after = timeit.default_timer()
    option_data = {
        "options": result,
        "lastUpdated": str(datetime.now().strftime("%H:%M:%S")),
        "timeTaken": str(round((after - before), 2)),
    }
    set_last_updated(option_data)
    socketio.emit("optionData", json.dumps(option_data))


def get_ranks():
    socketio.emit("ranks", "voila")


async def background_thread():
    minutes = 5
    # if connected_time_minute%5
    start = datetime.now().replace(hour=9, minute=15)
    end = datetime.now().replace(hour=21, minute=30)
    # print(datetime.now() > start, datetime.now() < end)
    # get minutes from conn and mod 5 if 2 sleep for 5-2
    # while datetime.now() > start and datetime.now() < end:
    while True:
        analyze_options()
        # get_ranks()
        # time.sleep(minutes * 60)
        await asyncio.sleep(minutes * 60)
        # time.sleep(5)


@socketio.on("connect")
def connect():
    print(f"client {request.sid} connected")
    socketio.emit("optionData", json.dumps(last_updated))


@socketio.on("disconnect")
def disconnect():
    print(f"client disconnected")


if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    start_server = websockets.serve(hello, '0.0.0.0', 3213)
    print("Started")
    task = loop.create_task(background_thread())
    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_forever()
