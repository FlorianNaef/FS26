 // --- H file ---
class Dozent {
    // La funzione amica permette l'accesso ai membri privati
    // Funzione globale
    friend Dozent operator+(const Dozent& d1, const Dozent& d2);

private:
    int numb;

public:
    Dozent(int n) : numb(n) {}
};

// --- CPP file ---
Dozent operator+(const Dozent& d1, const Dozent& d2) {
    return Dozent(d1.numb + d2.numb);
}