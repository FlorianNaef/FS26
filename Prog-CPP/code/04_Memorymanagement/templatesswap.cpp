// H-File
template<typename T>
void swap(T& a, T& b); // deklaration
    
template<typename T> // definition (immer .h)
void swap(T& a, T& b) { // REFERENCES for parameter
    T temp{b};
    b = a;
    a = temp;
}