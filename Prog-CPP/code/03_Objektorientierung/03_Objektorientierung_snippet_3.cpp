class C1 { ... };

// Il virtual va inserito qui (classi intermedie)
class C2 : virtual public C1 { ... };
class C3 : virtual public C1 { ... };

// C4 eredita normalmente; ordine ctor: C1 -> C2 -> C3 -> C4
class C4 : public C2, public C3 {
public:
    C4() : C1(), C2(), C3() { ... }
};
