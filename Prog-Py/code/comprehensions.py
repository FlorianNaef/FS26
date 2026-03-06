# 1. Nested loops
# Syntax: [expression for outer_item in outer_iterable for inner_item in inner_iterable]
fields = [b + str(n) for b in letters for n in numbers]

# Normal form equivalent
for b in letters:
    for n in numbers:
        b + str(n)

# 2. ONLY IF (Filtering) -> Placed at the END
# Syntax: [expression for item in iterable if condition]
filtered_values = [item**2 for item in range(1, 11) if (item**2) % 4 != 0]

# 3. IF/ELSE (Modifying) -> Placed at the BEGINNING
# Syntax: [expression_if_true if condition else expression_if_false for item in iterable]
modified_values = [item**2 if (item**2) % 4 != 0 else 0 for item in range(1, 11)]