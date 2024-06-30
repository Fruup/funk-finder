from instaloader.instaloader import Instaloader
from instaloader.structures import Post
import json
import glob
import shutil

client = None

def init():
	global client

	username = "leonmaj7"

	client = Instaloader(
		compress_json=False,
		download_pictures=False,
		download_videos=False,
		download_video_thumbnails=False,
		download_geotags=False,
		download_comments=False,
	)

	client.load_session_from_file(username, "./state/session")
	print("Logged in as", client.test_login())

def download_post(shortcode):
	post = Post.from_shortcode(client.context, shortcode)
	client.download_post(post, shortcode)

def collect_post(shortcode):
	# read and parse json and caption files
	jsonFiles = glob.glob(f"./{shortcode}/*.json")
	if len(jsonFiles) == 0:
		raise Exception(f"No file found for shortcode '{shortcode}'!")
	
	jsonFilename = jsonFiles[0]
	with open(jsonFilename) as file:
		text = file.read()
		data = json.loads(text)

	# textFilename = glob.glob(f"./{shortcode}/*.txt")[0]
	# with open(textFilename) as file:
	# 	text = file.read()
	# 	caption = json.loads(text)

	node = data["node"]
	type = node["__typename"]
	media = []

	result = {
		"type": type,
		"igId": node["id"],
		"media": media,
		# "shortcode": shortcode,
	}

	if type == "GraphImage":
		media.append({
			"igId": node["id"],
			"url": node["display_url"],
		})
	elif type == "GraphSidecar":
		children = node["edge_sidecar_to_children"]["edges"]

		for child in children:
			media.append({
				"igId": child["node"]["id"],
				"url": child["node"]["display_url"],
			})

	return result

def delete_post_data(shortcode):
	try:
		shutil.rmtree(shortcode)
	except:
		pass
