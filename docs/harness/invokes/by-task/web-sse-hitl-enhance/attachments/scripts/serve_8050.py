import logging, sys
sys.path.insert(0, "/Users/cyning/Desktop/Ops-desk/ops-desk-api")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")
import uvicorn
uvicorn.run("app.main:app", host="127.0.0.1", port=8050)
