# Save array to a text file with specific formatting
x = np.arange(100).reshape(20,5)
np.savetxt("my_data.txt", x, fmt="%2d", delimiter=",")

# Load specific columns from a text file
y = np.loadtxt("my_data.txt", delimiter=",", usecols=(0, 2, 4))