from src.session import session


def action_menu():
    print("1. HIT", "2. STAND", sep="\n")
    while True:
        choice = input("Enter choice: ")
        if choice == "1":
            return "hit"
        elif choice == "2":
            return "stand"
        else:
            print("Wrong choice")
