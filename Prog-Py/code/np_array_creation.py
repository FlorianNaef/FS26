arr = np.array([1, 2, 3])# Basic 1D array
np.ones((3, 3))          # 3x3 array of 1s
np.zeros_like(arr)       # Array of 0s with the shape of 'arr'
np.full((3, 2), 10)      # 3x2 array filled with 10
np.eye(5)                # 5x5 Identity matrix
np.linspace(0, 1, 10)    # 10 evenly spaced values from 0 to 1
np.arange(0, 4, 0.5)     # Values from 0 to 4 (exclusive), step 0.5
np.random.randn(3, 2)    # Standard normally distributed random numbers
np.random.randint(0, 100, (3))  # 1D arr with 3 Uniformly distributed integers between 0-100
