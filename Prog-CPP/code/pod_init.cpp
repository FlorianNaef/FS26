// Zuweisung fuer POD:
int i; // Speicher fuer Instanz wird alloziert, Wert ist uninitialisiert
i = 5; // Wert (aus anderer Speicherstelle) wird zugewiesen

// Initialisierung fuer POD: Kein weitere Speicherverbrauch
int i = 5;  // (C-Style)
int i(5); // (C++-Style bis C++11)
int i{5}; // (neuer C++-Style)
// Aus Effizienzgruenden bevorzugen wir (fast) immer die (direkte) Initialisierung!
