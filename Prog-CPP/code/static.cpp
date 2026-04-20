// Logger.h
class Logger {
    public:
        static void log(const std::string& message);
    private:
        static int nrObjects; // Non inizializzabile dirett.
};
// Logger.cpp
int Logger::nrObjects = 34; // Necesario!
// main.cpp
int main() {
    // Benutze log aus Logger, ohne Instanz:
    Logger::log("C++ ist super!");// class name wird verwendet!
    return 0;
}