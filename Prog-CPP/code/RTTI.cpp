#include <typeinfo>
int main() {
    int a{0};
    float b{0.0f};
    if (typeid(a) != typeid(b)) {// is always true
    }// because they have a different type
}