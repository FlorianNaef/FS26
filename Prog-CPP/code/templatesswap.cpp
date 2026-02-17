// H-File
template<typename T>
void swap(T& a, T& b); // deklaration
    
template<typename T> // definition
void swap(T& a, T& b) {
    T temp{b};
    b = a;
    a = temp;
}