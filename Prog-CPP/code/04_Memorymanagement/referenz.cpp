// 1. Usa const per oggetti grandi in sola lettura
// Ottimizza le prestazioni impedendo modifiche accidentali
int foo(const BigType& b); 

// 2. Passa SEMPRE struct e classi per referenza
void process(MyClass& obj); 

// 3. ERRORE DA EVITARE: mai tornare referenze locali
int& func() {
    int x = 10;
    return x; // PERICOLO: x viene distrutta all'uscita!
} // La referenza diventerebbe "dangling" (punta al vuoto)