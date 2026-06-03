// .h
class Complex
{
  public:
    Complex(const Complex& c);   // Copy constructor
    Complex& add(const Complex& c); // adds c to the current object
};
// complex.cpp
Complex& Complex::add(const Complex& c) {
    this->re += c.re;
    this->im += c.im;
    return *this;
}   

// main.cpp
    Complex c3 = c1.add(c0).add(c2);
    // c1 viene aggiornato correttamente 
    // c3 viene creato tramite copy ctor
