import pathlib

# Composing a path object utilizing the / operator
file_path = pathlib.Path.cwd() / 'recipes' / "output.txt"

# Writing files safely using the 'with' context manager
with open(file_path, "w", encoding="utf-8") as f:
    f.write("String data\n")
    f.writelines(["Line 2\n", "Line 3\n"])

# Reading files line by line directly via the file object
with open(file_path, "r", encoding="utf-8") as f:
    for line in f:
        print(line.strip())