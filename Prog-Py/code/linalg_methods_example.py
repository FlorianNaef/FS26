A = np.array([[3, 1], [1, 2]])
b = np.array([9, 8])

# Exact solution
x = np.linalg.solve(A, b) 

# Eigen-decomposition
eigenvalues, eigenvectors = np.linalg.eig(A)

# Least squares (e.g., for linear regression)
# rcond=None uses the machine precision default
x_ls, res, rank, s = np.linalg.lstsq(A, b, rcond=None)