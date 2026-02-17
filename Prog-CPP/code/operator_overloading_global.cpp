// H file
class Dozent{
    friend Dozent& operator+(Dozent& in1, Dozent& in2);
                //der + Operator wird ueberschriben
    private:
        int numb;
};

Dozent& operator+(Dozent& in1, Dozent& in2);

// ------ start cpp ------
Dozent& operator+(Dozent& in1, Dozent& in2){
        in1.numb += in2.numb;// whatever Operation welche zum + Operator passt
        return in1;
}