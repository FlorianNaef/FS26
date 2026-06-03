class Stuff{
    public:
        Stuff& funktion(int valIn);
    private:
        int value;
};
Stuff& Stuff::funktion(int valIn){
    //do Stuff with val z.b. addieren auf interne Variabel
    this->funktion(0);// auch moeglich
    return *this;//this pointer -> wird dereferenziert und Referenz zurueckgegeben
}
int main(){
    Stuff memb;
    memb.funktion(1).funktion(2).funktion(3); 
}