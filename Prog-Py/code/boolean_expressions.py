# Walrus Operator (:=)
if (a := int(input("Enter a number: "))) > 3:
    print("Number is greater than 3.")

# Ternary Operator
b = 5
a = b if b > 3 else 0

# == vs is
my_list = [1, 2, 3]
print(my_list == [1, 2, 3])  # True (values are identical)
print(my_list is [1, 2, 3])  # False (different objects in memory)

# in Operator
fruits = ["banana", "apple"]
print("apple" in fruits)     # True