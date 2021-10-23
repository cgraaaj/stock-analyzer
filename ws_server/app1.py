import asyncio
import websockets
from analyze.analyze import analyze_option_trend
from analyze.getDB import get_database
from flask import Flask
from flask_socketio import SocketIO, emit, send
import asyncio


clients = []
async def hello(websocket, path):
    print(websocket.remote_address)
    while True:
        try:
            await websocket.send("hello")
            clients.append(websocket)
            # while True:
            #     pass
            await asyncio.sleep(60)
        except websockets.ConnectionClosed:
            print(f"Terminated")
            break
        except Exception as e:
            raise e

# async def periodic():
#     while True:
#         print('periodic')
#         for client in clients:
#             await client.send("hello")
#         await asyncio.sleep(60)

if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    start_server = websockets.serve(hello, '0.0.0.0', 8888)
    print("Started")
    # loop.create_task(periodic())
    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_forever()
