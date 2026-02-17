int main() {
    int x;
    std::cin >> x;
    try {
        a(x); // can throw various types of exceptions
    } catch (const char* e) {// handles only Type const char*
        std::clog << e << std::endl;
    } catch (int i) {// handles only Type int
        std::cerr << i << std::endl;
    } catch (...) {// handles whatever...
        std::cerr << "other exception occured" << std::endl;
    }
return 0;