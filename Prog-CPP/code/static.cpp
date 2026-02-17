class Logger {
    static void log(const std::string& message);
};

// End H-File----

int main() {
    // Benutze log aus Logger, ohne Instanz:
    Logger.log("C++ ist super!");// class name wird verwendet!
    return 0;
}