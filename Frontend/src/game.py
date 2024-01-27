from src.session import session
from src.mqtt import mqtt_client, subscribe_to_game
from src.actions import action_menu


def game_menu():
    balance = session.get(
        f"https://localhost:3000/users/balance/{session.cookies.get('userId')}",
        headers={"Authorization": session.cookies.get("token")},
        verify=False,
    ).json()
    print(f"Your balance: {balance['balance']}")
    stake = int(input("Enter stake: "))

    response = session.post(
        "https://localhost:3000/games",
        headers={"Authorization": session.cookies.get("token")},
        json={"stake": stake},
        verify=False,
    )
    if response.status_code != 200:
        print("Game creation failed")
        return None
    game = response.json()
    subscribe_to_game(game["id"])
    while game["status"] != "completed":
        game = session.get(
            f"https://localhost:3000/games/{game['id']}",
            headers={"Authorization": session.cookies.get("token")},
            verify=False,
        ).json()
        print(f"Dealer's cards: {game['dealerCards']}")
        print(f"Your cards: {game['playerCards']}")
        game = action_menu(game)