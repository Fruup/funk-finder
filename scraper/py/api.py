import lib
from fastapi import FastAPI
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
	lib.init()
	yield

app = FastAPI(lifespan=lifespan)

@app.get("/")
def read_root():
	return {"Hello": "World"}

@app.get("/posts/{shortcode}")
def get_post(shortcode: str):
	lib.download_post(shortcode)
	result = lib.collect_post(shortcode)
	lib.delete_post_data(shortcode)
	
	return result
