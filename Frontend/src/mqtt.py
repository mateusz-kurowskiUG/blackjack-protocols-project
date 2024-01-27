import paho.mqtt.client as mqtt
from src.session import session

mqtt_client = mqtt.Client()
mqtt_client.connect("localhost", 1883, 60)
mqtt_client.on_subscribe = lambda client, userdata, mid, granted_qos: print(
    "subscribed"
)


def print_message(client, userdata, message):
    print(message.payload.decode())


mqtt_client.on_message = print_message


def connect_to_public_chat():
    hello_public()
    mqtt_client.subscribe("public")


def hello_public():
    username = session.cookies.get("username")
    mqtt_client.publish("public", f"{username}:Joined the chat")


def receive_message_from_public_chat():
    mqtt_client.loop_start()


def send_message_to_public_chat(message):
    username = session.cookies.get("username")
    mqtt_client.publish("public", f"{username}:{message}")


def disconnect_from_public_chat():
    mqtt_client.publish("public", f"{session.cookies.get('username')}:Left the chat")
    mqtt_client.unsubscribe("public")
