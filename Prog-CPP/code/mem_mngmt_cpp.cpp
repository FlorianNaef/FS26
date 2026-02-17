
int main(){
    int* intPtr = new int;
    // Allokiert fuer intPtr ein Speicherbereich eines Ints
    int* intArrayPtr = new int[10];
    // Allokiert fuer intArrayPtr ein Speicherbereich eines Int Array der groesse 10
    if(intPtr == nullptr) return-1;// Nullpointercheck
    delete intPtr;
    // Gibt intPtr wieder frei
    delete[] intArrayPtr;
    // Gibt intArrayPtr wieder frei
}
