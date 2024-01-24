from requests import Session
import getpass


def login(name, password):
    session = Session()
    response = session.post(
        f"https://localhost:3000/auth/login",
        json={"name": name, "password": password},
        verify=False,
    )
    if response.status_code == 200:
        return response.json()
    else:
        return None


def register(name, password):
    session = Session()
    response = session.post(
        f"https://localhost:3000/auth/register",
        json={"name": name, "password": password},
        verify=False,
    )
    if response.status_code == 200:
        return response.json()
    else:
        return None


def auth_menu():
    print("1. Login", "2. Register", "3. Exit", sep="\n")

    choice = input("Enter choice: ")
    if choice in ["1", "2"]:
        username = input("Username: ").strip()
        password = getpass.getpass("Password: ").strip()
        if choice == "1":
            result = login(username, password)
            if result is None:
                print("Login failed")
            else:
                print("Login successful")
                print(result)
                return result["token"], result["user"]

        elif choice == "2":
            result = register(username, password)
            if result is None:
                print("Registration failed")
            else:
                print("Registration successful")
    elif choice == "3":
        exit()
    else:
        print("Invalid choice")
        auth_menu()
