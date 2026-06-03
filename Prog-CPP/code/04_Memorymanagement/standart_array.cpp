#include <array> // Mandatory to use std::array!
template <typename T, std::size_t n>
void print(const std::array<T, n>& arr) {
    for (size_t i = 0; i < arr.size(); ++i) {
        std::cout << arr[i] << " ";
    }
    std::cout << std::endl;
}

int main() {
    std::array<int, 5> number = {1, 2, 3, 4, 5};
    std::array<double, 3> dnumber = {1.45, -2.32, 345.432};

    std::cout << "Third elem.: " << number.at(2) << std::endl;
}