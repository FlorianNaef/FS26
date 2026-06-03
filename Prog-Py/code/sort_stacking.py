data_list = [(1, "D"), (3, "B"), (2, "B"), (5, "E"), (4, "A"), (6, "D")]

# Approach 1: Stacking sorts (exploiting Timsort stability)
# The least priority sort goes first
data_list.sort(key=lambda x: str(x[0])) 
# The main priority filter goes last
data_list.sort(key=lambda x: str(x[1])) 

# Approach 2: Single sort with a tuple hierarchy
# Equivalent to the stacked approach above
data_list.sort(key=lambda x: (str(x[1]), str(x[0])))