# List of tuples containing duplicate entries
contacts = [
    ('Maria', '022 548 95 26'), 
    ('Patrick', '081 445 66 58'), 
    ('Patrick', '081 445 66 58') # Duplicate
]

# 1. dict(contacts) removes the duplicate 'Patrick' key
# 2. .items() returns the key-value pairs
# 3. list() converts them back into a list of tuples
data_unique = list(dict(contacts).items())

print(data_unique)
# Output: [('Maria', '022 548 95 26'), ('Patrick', '081 445 66 58')]