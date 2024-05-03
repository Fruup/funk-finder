import lib
from fastapi import FastAPI

app = FastAPI()

lib.init()

@app.get("/")
def read_root():
	return {"Hello": "World"}

@app.get("/posts/{shortcode}")
def get_post(shortcode: str):
	lib.download_post(shortcode)
	result = lib.collect_post(shortcode)
	lib.delete_post_data(shortcode)
	
	return result
