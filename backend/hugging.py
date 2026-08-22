from gradio_client import Client, file

client = Client("yisol/IDM-VTON")
result = client.predict(
		dict={"background":file('https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png'),"layers":[],"composite":null},
		garm_img=file('https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png'),
		garment_des="Hello!!",
		is_checked=True,
		is_checked_crop=False,
		denoise_steps=30,
		seed=42,
		api_name="/tryon"
)
print(result)