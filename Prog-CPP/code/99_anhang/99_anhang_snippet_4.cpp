template<typename T, std::size_t N = 100>
class Container {
    T data[N]; // Legale solo perche N e noto al compilatore
};

Container<int, 20> c1; // Alloca spazio per 20 int sullo Stack
Container<int> c2;     // Usa il default di 100
