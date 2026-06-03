class Stack {
public:
    int pop();               // Modifica lo stato (rimuove elemento)
    bool isEmpty() const;    // Sola lettura (osserva lo stato)
};

void check(const Stack& s) {
    s.isEmpty();  // OK: il metodo promette di non modificare s
    // s.pop();   // ERRORE: pop() potrebbe modificare s
}
