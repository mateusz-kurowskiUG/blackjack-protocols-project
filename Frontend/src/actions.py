from src.session import session


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

    print(response)
    if response.status_code == 200:
        # solve!!!!!!!!!!!!

        return response.json()

    else:
        print("error")
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
