class TString {
public:
    TString();                         // 1: Default Ctor
    TString(const TString& s);        // 2: Copy Ctor
    TString(const char* p);           // 3: Ctor da stringa
    explicit TString(int i);          // 4: Ctor esplicito da int
    // ...
};

TString s1 = "Hoi";    // 3
TString s2;            // 1
TString s21 = s1;      // 2
s2 = s1;               // Nessun Ctor (Assignment operator)
TString& s3 = s21;     // Nessun Ctor (Riferimento)
TString s4[2];         // 1, 1 (Array di 2 elementi)
TString* p1 = &s21;    // Nessun Ctor (Puntatore)
TString* p2 = new TString{"Hallo"}; // 3 (Allocazione su heap)
TString* p3 = new TString[3];       // 1, 1, 1 (Array di 3 su heap)
TString s5[3] = {"Hoi", TString{}, s2}; // 3, 1, 2

// Esempio per il Ctor 4 (explicit)
TString s13 = TString{13};              // 4