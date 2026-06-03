// Dichiarazioni che possono essere sostituite
bool TString::operator<(const TString& s) const;
bool TString::operator<(const char* p) const;
friend bool operator<(const char* p, const TString& s);

// Possono essere ridotte a:

// Queste dichiarazioni sono sufficienti
TString(const char* p); // Typumwandlungs-Ctor
friend bool operator<(const TString& s1, const TString& s2);