from src.session import session
from src.mqtt import unsubscribe_from_game, subscribe_to_game


def hit(game_id):
    response = session.patch(
        f"https://localhost:3000/games/hit/{game_id}",
        headers={"Authorization": session.cookies.get("token")},
        verify=False,
    )
    if response.status_code == 200:
        return response.json()
    else:
        print("error")
        return


def stand(game_id):
    response = session.patch(
        f"https://localhost:3000/games/stand/{game_id}",
        headers={"Authorization": session.cookies.get("token")},
        verify=False,
    )
    if response.status_code == 200:
        return response.json()

    else:
        print("error, could not stand")
        return


def solve(game_id):
    response = session.post(
        f"https://localhost:3000/games/solve",
        headers={"Authorization": session.cookies.get("token")},
        json={"gameId": game_id},
        verify=False,
    )

    if response.status_code == 200:
        unsubscribe_from_game(game_id)
        return response.json()
    else:
        print("error, could not solve")
        return


def action_menu(game):
    print("1. HIT", "2. STAND", sep="\n")
    while True:
        choice = input("Enter choice: ")
        if choice == "1":
            return hit(game["id"])
        elif choice == "2":
            return stand(game["id"])
        else:
            print("Wrong choice")
