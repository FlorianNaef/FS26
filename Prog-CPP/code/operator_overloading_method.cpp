// H file
class Dozent{
    friend Dozent& operator+(int in1, Dozent& in2);
    public: // friends immer vors public
        Dozent& operator+(Dozent& in1);//der + Operator wird ueberschriben(Falls eine andere Instanz addiert wird)
        Dozent& operator+(int in1);//der + Operator wird ueberschriben(falls ein int addiert wird)
    private:
        int number;
};
Dozent& operator+(int in1, Dozent& in2);//dieser Fall muss global / mit friend geloest werden

// ------ start cpp ------
Dozent& operator+(int in1, Dozent& in2){
        in2.number += in1;
        return in2; 
}
Dozent& Dozent::operator+(Dozent& in2){
    number += in2.number;
    return *this;
}
Dozent& Dozent::operator+(int in2){
    number += in2;
    return *this;
}

// ------ start main file ------ 
main(){
    Dozent D1;
    Dozent D2;
    D1 + D2;// fall mit anderer Instanz
    D1 + 1;// fall mit int
    1  + D1;// durch Global overloading abgedeckt
}
