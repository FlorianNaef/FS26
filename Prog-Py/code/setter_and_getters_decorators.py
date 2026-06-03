class BankAccount:
    def __init__(self, balance):
        self._balance = balance

    @property
    def balance(self):
        """Getter: returns the balance."""
        print("Balance requested.")
        return self._balance

    @balance.setter
    def balance(self, value):
        """Setter: updates the balance."""
        if value >= 0:
            self._balance = value
        else:
            print("Invalid amount.")