x = 5

if x == 5:
    print("5")
else:
    print("Not 5")

match x:
    case 5:
        print("5")
    case 4:
        print("4")
    case _:
        print("Default case")