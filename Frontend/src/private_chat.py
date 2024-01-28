from src.session import session
import os
from src.mqtt import mqtt_client, connect_to_private_chat


def show_chats():
    os.system("cls")
    response = session.get(
        f"https://localhost:3000/users/user/chats/{session.cookies.get('userId')}",
        headers={"Authorization": session.cookies.get("token")},
        verify=False,
    )
    print("-----------", "Public chats", "-----------", sep="\n")
    if len(response.json()) == 0:
        print("No chats available")
    for i in response.json():
        print(i["name"])
    print("-----------", "EOF public chats", "-----------", sep="\n")
    return


def create_private_chat():
    name = input("Enter name of the chat:\n")
    password = input("Enter password of the chat:\n")
    response = session.post(
        "https://localhost:3000/chats/private",
        headers={"Authorization": session.cookies.get("token")},
        json={"name": name, "password": password},
    )
    if response.status_code == 200:
        print("Chat created")
    else:
        print("Chat creation failed")

def join_by_name():
    name = input("Enter name of the chat:\n").strip()
    password = input("Enter password of the chat:\n")
    response = session.post(
        f"https://localhost:3000/chats/{name}/join",
        headers={"Authorization": session.cookies.get("token")},
        json={"password": password},
    )
    if response.status_code == 200:
        chat = response.json()
        connect_to_private_chat(name)
        while True:
            message = input("Enter message: \n")
            if message == ":q!":
                mqtt_client.unsubscribe(f"private/{name}")
                break
            mqtt_client.publish(f"private/{name}", f"{session.cookies.get("username")}:message")
    else:
        print("Chat joining failed")

def join_your_private_chat():
    chats = session.get(
        "https://localhost:3000/chats/",
        headers={"Authorization": session.cookies.get("token")},
    ).json()
    if not chats or len(chats) == 0:
        print("No chats available")
        return
    for i, chat in enumerate(chats):
        print(i + 1, chat["name"], sep=". ")
    choice = input("Enter choice: ")
    if choice.isdigit():
        choice = int(choice)
        if choice == 0:
            return
        elif choice > 0 and choice <= len(chats):
            chat = chats[choice - 1]
            print("Joining chat", chat["name"])
            password = input("Enter password: ")
            response = session.post(
                f"https://localhost:3000/chats/{chat['name']}/join",
                headers={"Authorization": session.cookies.get("token")},
                json={"password": password},
            )

            if response.status_code == 200:
                connect_to_private_chat(chat["name"])
                while True:
                    message = input("Enter message: \n")
                    if message == ":q!":
                        mqtt_client.unsubscribe(f"private/{chat['name']}")
                        break
                    mqtt_client.publish(f"private/{chat['name']}", f"{session.cookies.get("username")}:message")

        else:
            print("Wrong choice")
    else:
        print("Wrong choice")


def private_chat_menu():
    print("1. Create private chat", "2. Join private chat","3. Join chat with name", sep="\n")
    choice = input("Enter choice: ")
    if choice == "1":
        create_private_chat()
    elif choice == "2":
        join_your_private_chat()
    elif choice=="3":
        join_by_name()
    else:
        print("Wrong choice")
