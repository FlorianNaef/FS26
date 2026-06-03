class Filter:
    def __init__(self, pattern):
        self.pattern = pattern

class Logger:
    # Aggregation: Logger "has" filters and handlers.
    # The components can exist independently of the Logger instance.
    def __init__(self, filters, handlers):
        self.filters: list[Filter] = filters
        self.handlers: list[Handlers] = handlers