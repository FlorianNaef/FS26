#include <iostream>

int divide(int dividend, int divisor) {
    if (divisor == 0) throw "Division by zero!";
    return dividend/divisor;
}
int foo(int a, int b) {
    std::cout << "Entering foo()" << std::endl;
    int result = divide(a, b); // can throw exception
    std::cout << "Leaving foo()" << std::endl;
    return result;
}

int main() {
    try {
        std::cout << foo(7,0) << std::endl;
    } catch (const char* e) {
        std::clog << "Not optimal but ok, " << e << std::endl;
    }// just writes the Error to the log
    
    // continue Program Function
    std::clog << "Continue Programm" << std::endl;

    try {
        std::cout << foo(12,0) << std::endl;
    } catch (const char* e) {
        std::cerr << "Critical error: " << e << std::endl;
        std::cerr << "Program terminating" << std::endl;
        exit(-1);
    }
    std::clog << "finish Programm" << std::endl;
    // continue Program Function
}