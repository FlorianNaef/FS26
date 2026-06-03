original = ["F", "B", "C", "G", "A", "D", "E"]
# Generate an array of indices: [0, 1, 2, 3, 4, 5, 6]
idxs = list(range(len(original)))

# Sort the indices based on the alphabetical value of the original elements
sorted_idxs = sorted(idxs, key=lambda i: original[i])
# Result: [4, 1, 2, 5, 6, 0, 3] (e.g., index 4 points to "A")

# Reconstruct the sorted array using the sorted indices
result = [original[i] for i in sorted_idxs]

# Generate a reverse mapping to find where original elements ended up
reverse_idxs = [result.index(char) for char in original]