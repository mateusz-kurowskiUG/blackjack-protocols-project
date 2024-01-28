from src.session import session


def create_private_chat():
    name = input("Enter name of the chat")
    password = input("Enter password of the chat")
    response = session.post(
        "https://localhost:3000/chats/",
        headers={"Authorization": session.cookies.get("token")},
        json={"name": name, "password": password},
    )
    if response.status_code == 200:
        print("Chat created")
    else:
        print("Chat creation failed")


def join_private_chat():
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
        else:
            print("Wrong choice")
    else:
        print("Wrong choice")


def private_chat_menu():
    print("1. Create private chat", "2. Join private chat", sep="\n")
    choice = input("Enter choice: ")
    if choice == "1":
        create_private_chat()
    elif choice == "2":
        join_private_chat()
    else:
        print("Wrong choice")
