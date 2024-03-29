from requests import post
from src.session import session
from src.mqtt import mqtt_client,connect_to_public_chat,disconnect_from_public_chat,send_message_to_public_chat,print_message
from src.public_chat import public_chat_menu
from src.game import game_menu
from src.private_chat import private_chat_menu,show_chats
import os
def create_game(user):
    stake = -1
    while stake < 1 and stake > user["balance"]:
        os.system("cls")
        stake_number = int(input("Enter stake: "))
        if stake_number < 1:
            print("Stake must be at least 1")
        elif stake_number > user["balance"]:
            print("Stake must be less than or equal to your balance")
        else:
            stake = stake_number
    response = session.post(
        "https://localhost:3000/games",
        auth=(session.cookies.get("token"), ""),
        json={**user, "stake": stake},
        verify=False,
    )
    if response.status_code == 200:
        print("Game created")
        return response.json()
    else:
        print(response.json())
        print("Game creation failed")
        return None


def get_users(name=""):
    response = session.get(
        "https://localhost:3000/users",
        params={"name": name},
        headers={"Authorization": session.cookies.get("token")},
        verify=False,
    )
    if response.status_code == 200:
        return response.json()
    else:
        print(response.json())
        print("Users get failed")
        return None


def logout():
    response = session.post(
        "https://localhost:3000/auth/logout",
        verify=False,
    )
    if response.status_code == 200:
        print("Logout successful")
        session.cookies.clear()
        return True
    else:
        print(response.json())
        print("Logout failed")
        return False


def get_balance():
    os.system("cls")
    response = session.get(
        f"https://localhost:3000/users/balance/{session.cookies.get("userId")}",
        headers={"Authorization": session.cookies.get("token")},
        verify=False,
    )
    print(response.json())
    if response.status_code == 200:
        return response.json()["balance"]

    else:
        print(response.json())
        print("Balance get failed")
        return None


def get_user_data():
    response = session.get(
        f"https://localhost:3000/users/data/{session.cookies.get("userId")}",
        headers={"Authorization": session.cookies.get("token")},
        verify=False,
    )
    if response.status_code == 200:
        return response.json()
    else:
        print(response.json())
        print("User data get failed")
        return None


def delete_account():
    response = session.delete(
        f"https://localhost:3000/users/{session.cookies.get("userId")}",
        headers={"Authorization": session.cookies.get("token")},
        verify=False,
    )
    if response.status_code == 200:
        print("Account deleted")
        logout()
        return response.json()
    else:
        print(response.json())
        print("Account deletion failed")
        return None

def update_user_data():
    print("What do you want to change?","1. Name", "2. Password",sep="\n")
    choice = input("Enter choice: ")
    if choice == "1":
        name = input("Enter new name: ")
        response = session.patch(
            f"https://localhost:3000/users/{session.cookies.get("userId")}",
            headers={"Authorization": session.cookies.get("token")},
            json={"name": name},
            verify=False,
        )
        if response.status_code == 200:
            print("Name changed")
            return response.json()
        else:
            print(response.json())
            print("Name change failed")
            return None
    elif choice == "2":
        password = input("Enter new password: ")
        response = session.patch(
            f"https://localhost:3000/users/{session.cookies.get("userId")}",
            headers={"Authorization": session.cookies.get("token")},
            json={"password": password},
            verify=False,
        )
        if response.status_code == 200:
            print("Password changed")
            return response.json()
        else:
            print(response.json())
            print("Password change failed")
            return None
    else:
        print("Invalid choice")
        update_user_data()

def games_history():
    response = session.get(
        f"https://localhost:3000/users/user/games/{session.cookies.get("userId")}",
        headers={"Authorization": session.cookies.get("token")},
        verify=False,
    )
    if response.status_code == 200:
        return response.json()
    else:
        print(response.json())
        print("Games history get failed")
        return None

def delete_game_history():
    response = session.delete(f"https://localhost:3000/games",headers={"Authorization": session.cookies.get("token")},verify=False)
    if response.status_code == 200:
        print("Game history deleted")
        return response.json()
    else:
        print(response.json())
        print("Game history deletion failed")
        return None
    
def delete_game_from_history():
    games = games_history()
    if games is None or len(games) == 0:
        print("No games")
        return None
    print("--------Stake Status-----")
    for i,game in enumerate(games):
        print(f"{i}. {game["stake"]} {game["status"]}")
    print("--------Stake Status-----")
    game_number = int(input("Enter game number: "))
    if game_number < 0 or game_number >= len(games):
        print("Invalid game number")
        return None
    chosen = games[game_number]
    response = session.delete(f"https://localhost:3000/games/{chosen["id"]}",headers={"Authorization": session.cookies.get("token")},verify=False)
    if response.status_code == 200:
        print("Game deleted")
        return response.json()
    else:
        print(response.json())
        print("Game deletion failed")
        return None
    
def enter_all_chat():
    public_chat_menu()

def leave_all_chat():
    disconnect_from_public_chat()

def logged_menu():
    print(
        "1. Create a game",
        "2. Show users",
        "3. Find user by name",
        "4. Show your balance",
        "5. Show your data",
        "6. Delete your account",
        "7. Change your data",
        "8. Game history",
        "9. Enter public chat",
        "10. Enter/Create Private chat",
        "11. Show your chats",
        "12. Delete game history",
        "13. Delete game FROM history",
        "14. Logout",
        sep="\n",
    )
    choice = input("Enter choice: ")
    if choice == "1":
        os.system("cls")
        game_menu()
    elif choice == "2":
        os.system("cls")
        users = get_users()
        if users is None:
            print("No users")
        else:
            print("Name Balance")
            for user in users:
                print(f"{user["name"]} {user["balance"]}")
    elif choice == "3":
        os.system("cls")
        input_name = input("Enter name: ")
        users = get_users(input_name)
        if users is None:
            print("No users")
        else:
            print("Name Balance")
            for user in users:
                print(f"{user["name"]} {user["balance"]}")
    elif choice == "4":
        os.system("cls")
        result = get_balance()
        print(result)
    elif choice == "5":
        os.system("cls")
        result = get_user_data()
        print(f"{result["userId"]} {result["name"]} {result["balance"]}")
    elif choice == "6":
        os.system("cls")
        result = delete_account()
        print(result)
    elif choice == "7":
        os.system("cls")
        result = update_user_data()
        print(result)
    elif choice == "8":
        os.system("cls")
        history = games_history()
        if history is None or len(history) == 0:
            print("No games")
        else:
            print("--------Game history-----------")
            print("Stake Status")
            for i,game in enumerate(history):
                print(f"{i}. {game["stake"]} {game["status"]}")
            print("--------Game history-----------")
            
    elif choice == "9":
        os.system("cls")
        print("Enter public chat")
        enter_all_chat()
    elif choice == "10":
        os.system("cls")
        private_chat_menu()
    elif choice == "11":
        os.system("cls")
        show_chats()
    elif choice == "12":
        os.system("cls")
        delete_game_history()
    elif choice == "13":
        delete_game_from_history()
    elif choice == "14":
        os.system("cls")
        if logout():
            return True
    else:
        os.system("cls")
        print("Invalid choice")
        logged_menu()
