a = np.ones((2, 3, 3))
b = np.ones((2, 3, 3))

# Result: (2, 3, 3) -> Multiplies stacks independently
res_matmul = a @ b 

# Result: (2, 3, 2, 3) -> Multiplies every row by every column
res_dot = np.dot(a, b)     