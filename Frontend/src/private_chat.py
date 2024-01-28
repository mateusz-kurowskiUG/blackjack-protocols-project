def create_private_chat():
    name = input("Enter room: ")
    

def join_private_chat():
    pass


def private_chat_menu():
    print("1. Create private chat", "2. Join private chat", sep="\n")
    choice = input("Enter choice: ")
    if choice == "1":
        create_private_chat()
    elif choice == "2":
        join_private_chat()
    else:
        print("Wrong choice")
