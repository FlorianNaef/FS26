void f(); // name in global Namespace (1. f())
namespace myLib{void f(); int i} // namespace myLib (2. f())
f(); // f von global Namespace
myLib::f(); // f von namespace myLib
using namespace myLib;
using myLib::i; // posso usare using anche per singole var.
::f(); // 1. f()
f(); // 2. f()

// Nameless namespace
namespace {
    int localCounter = 0; // Invisibile all'esterno di questo file
}
void funzionePubblica() {
    localCounter++; // instead of static
}