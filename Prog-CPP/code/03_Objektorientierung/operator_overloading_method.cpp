// --- H file ---
class Dozent {
private:
    int number;

public:
    Dozent(int n = 0) : number(n) {}

    // 1. Metodo membro: Dozent + Dozent
    Dozent operator+(const Dozent& other) const;

    // 2. Metodo membro: Dozent + int
    Dozent operator+(int val) const;
};

// --- CPP file ---
Dozent Dozent::operator+(const Dozent& other) const {
    return Dozent(this->number + other.number);
}

Dozent Dozent::operator+(int val) const {
    return Dozent(this->number + val);
}