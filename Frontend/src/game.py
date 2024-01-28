from src.session import session
from src.mqtt import mqtt_client, subscribe_to_game
from src.actions import action_menu, solve


def print_hands(game):
    print("--------------------", f"Dealer's cards: {game['dealerCards']}",f"Your cards: {game['playerCards']}","-----------------", sep="\n")



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
    while game["status"] not in ["won", "lost", "draw"]:
        game = session.get(
            f"https://localhost:3000/games/{game['id']}",
            headers={"Authorization": session.cookies.get("token")},
            verify=False,
        ).json()
        print_hands(game)
        if game["status"] == "completed":
            print(f"Game result: completed")
            break
        if game["status"] == "stand":
            solved = solve(game_id=game["id"])
            if solved:
                print(f"Game result: {solved["endedGame"]['status']}")
                print_hands(solved["endedGame"])
                
            break
        if game["status"] == "created":
            action_menu(game)
