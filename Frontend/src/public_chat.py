from src.mqtt import (
    disconnect_from_public_chat,
    print_message,
    send_message_to_public_chat,
    connect_to_public_chat,
    receive_message_from_public_chat,
    mqtt_client,
)
import os


def public_chat_menu():
    os.system("cls")
    connect_to_public_chat()
    mqtt_client.on_message = print_message
    print("Public chat")
    receive_message_from_public_chat()
    while True:
        message = input("")
        if message == ":q!":
            disconnect_from_public_chat()
            os.system("cls")
            break
        else:
            send_message_to_public_chat(message)
