import requests
from src.auth import auth_menu
from src.logged import logged_menu
from src.session import session


def main():
    while True:
        token = session.cookies.get("token")
        userId = session.cookies.get("userId")
        if token is None:
            auth_menu()
        else:
            logged_menu()


if __name__ == "__main__":
    main()
