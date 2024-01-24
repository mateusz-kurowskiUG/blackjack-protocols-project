from requests import post, session


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
    s = session()
    response = s.post(
        "https://localhost:3000/games",
        json={**user, "stake": stake},
        verify=False,
    )
    print(response)
    if response.status_code == 200:
        print("Game created")
        return response.json()
    else:
        print(response.json())
        print("Game creation failed")
        return None


def logged_menu(data):
    print("1. Create a game", "2. Logout", sep="\n")
    choice = input("Enter choice: ")
    if choice == "1":
        print(data["user"])
        create_game(data["user"])
    elif choice == "2":
        # logout()
        exit()
    else:
        print("Invalid choice")
        logged_menu()
