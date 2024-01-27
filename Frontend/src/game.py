from src.session import session


def game_menu():
    balance = session.get(
        f"https://localhost:3000/users/balance/{session.cookies.get('userId')}",
        headers={"Authorization": session.cookies.get("token")},
        verify=False,
    ).json()
    print(f"Your balance: {balance['balance']}")
    stake = int(input("Enter stake: "))

    game = session.post(
        "https://localhost:3000/games",
        auth=(session.cookies.get("token"), ""),
        json={"stake": stake},
        verify=False,
    )
