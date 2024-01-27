from requests import post
from src.session import session


def create_game(user):
    stake = -1
    while stake < 1 and stake > user["balance"]:
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
        "10. Logout",
        sep="\n",
    )
    choice = input("Enter choice: ")
    if choice == "1":
        create_game()
    elif choice == "2":
        users = get_users()
        if users is None:
            print("No users")
        else:
            for user in users:
                print(user)
    elif choice == "3":
        input_name = input("Enter name: ")
        users = get_users(input_name)
        if users is None:
            print("No users")
        else:
            for user in users:
                print(user)
    elif choice == "4":
        result = get_balance()
        print(result)
    elif choice == "5":
        result = get_user_data()
        print(result)
    elif choice == "6":
        result = delete_account()
        print(result)
    elif choice == "7":
        result = update_user_data()
        print(result)
    elif choice == "8":
        history = games_history()
        if history is None:
            print("No games")
        else:
            for game in history:
                print(game)
    elif choice == "9":
        print("Enter public chat")
    elif choice == "10":
        if logout():
            return True
    else:
        print("Invalid choice")
        logged_menu()
