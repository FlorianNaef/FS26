#include <iostream>
class Storage{
    public:
        Storage();
        virtual ~Storage();
        void add(int in);
        void nix(Storage inC);
    private:
        int* data;
        int size;
};//eine Klasse die Int Werte speichert, aehnlich wie ein array

// ---- End h File

Storage::Storage(){ // Konstruktor
    data = nullptr;
    size = 0;
}



Storage::~Storage(){ // Destruktor
    delete[] data;
    data = nullptr;
    size = 0; // Speicher der allokiert wurde sollte hier freigegeben werden
}
void Storage::add(int in){
    // todo
}
void Storage::nix(Storage inC){
    // todo
}

// ---- End cpp File

int main(){

    Storage* i1 = new Storage; // default konstruktor
    Storage i2; // default konstruktor
    i1->nix(i2); // Call-by-Value. Eine Kopie von i2 wird auf den Stack gelegt -> Copy-Konstruktor!
    
    delete i1; // destruktor von i1 wird explizit aufgerufen
    return; // destruktor von i2 wird implizit aufgerufen
}