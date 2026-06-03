class BankAccount:
    def __init__(self, balance):
        self._balance = balance

    def _get_balance(self):
        print("Getter called")
        return self._balance

    def _set_balance(self, value):
        print("Setter called")
        self._balance = value

    # Background implementation of the property
    balance = property(_get_balance, _set_balance)