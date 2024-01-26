import requests
from requests import Session
from src.auth import auth_menu
from src.logged import logged_menu


data = {}


def main():
    while True:
        if token is None:
            auth_result = auth_menu()
            if auth_result is not None:
                token, user = auth_result
                data["token"] = token
                data["user"] = user
        else:
            logged_menu(data)


if __name__ == "__main__":
    main()
