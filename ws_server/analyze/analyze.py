from analyze.optionTrend import OptionTrend
import asyncio
import time

def analyze_option_trend():
    start = time.time()
    ot = OptionTrend()
    asyncio.get_event_loop().run_until_complete(ot.get_option_trend("equities"))
    end = time.time()
    print("took {} seconds".format(end-start))
    # ot.save()
    ot.get_rank()
    return ot.get_result()