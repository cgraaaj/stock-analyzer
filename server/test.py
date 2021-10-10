# Importing flask module in the project is mandatory
# An object of Flask class is our WSGI application.
from flask import Flask, stream_with_context
from flask_cors import CORS
from waitress import serve
import os
import logging
import csv
import time

# from bson import json_util
from dotenv import load_dotenv
from nse.nse import nse
from analyze.analyze import analyze
from analyze.getOptionTrend import hello
import asyncio
import websockets

# Flask constructor takes the name of
# current module (__name__) as argument.
app = Flask(__name__)
app.register_blueprint(nse, url_prefix="/nse")
app.register_blueprint(analyze, url_prefix="/analyze")

# logging
logging.basicConfig(
    filename="server.log",
    level=logging.DEBUG,
    format="%(asctime)s %(levelname)s %(name)s %(threadName)s : %(message)s",
)

# cors
cors = CORS(app)
app.config["CORS_HEADERS"] = "Content-Type"

# The route() function of the Flask class is a decorator,
# which tells the application which URL should call
# the associated function.
@app.route("/hi", methods=["GET"])
def hi():
    return "hi"

@app.route('/test.csv')
def generate_large_csv():
    def generate():
        filename = 'test.csv'
        with open(filename, 'r') as csvfile:
            datareader = csv.reader(csvfile)
            for row in datareader:
                time.sleep(1)
                yield f"{','.join(row)}\n"
    return app.response_class(generate(), mimetype='text/csv')


# main driver function
if __name__ == "__main__":

    LOCATE_PY_DIRECTORY_PATH = os.path.abspath(os.path.dirname(__file__))
    load_dotenv("{}/.env".format(LOCATE_PY_DIRECTORY_PATH))
    # run() method of Flask class runs the application
    # on the local development server.
    port = 5000
    if os.getenv("FLASK_ENV") == "development":
        app.run(port=port, host="0.0.0.0", debug=True)
    else:
        serve(app, host="0.0.0.0", port=port)
    HOST = "localhost"
    PORT = 8766

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    start_server = websockets.serve(hello, HOST, PORT)
    print(f"Server Starting at {HOST} {PORT}")
    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_forever()
