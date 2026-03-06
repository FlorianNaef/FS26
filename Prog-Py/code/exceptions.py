# EAFP: try, except, else, finally
try:
    x = int(input("Enter a number other than zero: "))
    y = 1 / x
except ValueError:
    print('Oops. Not a valid integer.')
except ZeroDivisionError as e:
    print('Oops! ' + str(e))
else:
    print(f"Success! Result: {y}")
finally:
    print("Always executed.")

# LBYL
inp = input("Enter a number other than zero: ")
 
if(inp.isdecimal()): 
    x = int(inp)
    if x != 0: 
        print(1/x)
    else:
        print("Wrong Input!") 
else:
    print("Wrong Input!")