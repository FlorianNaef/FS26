#include <string>//Stl Strings
class Student {
    public: // folgende Elemente sind Public
        int IDNumber;
        void doStuff(int time = 0);
    private: // folgende Elemente sind Private(standart)
        std::string name;//String
        float bierkonsum;
        unsigned long long int investedHoursInET;
};
// ------ start cpp ------
//implementierung der doStuff Funktion
void Student::doStuff(int time = 0) {  
} //ToDo

int main(){
    Student typETStudent;//instanz erzeugen
    typETStudent.IDNumber = 1;//Attribute veraendern
    typETStudent.doStuff();//Methode rufen
}