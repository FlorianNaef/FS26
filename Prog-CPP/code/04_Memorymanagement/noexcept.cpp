void foo() noexcept; // Es kan KEINE Exception auftreten
void foo2(); // es KONNEN exceptions auftreten
void bar() noexcept(false); // es KONNEN exceptions auftreten

bool a = noexcept(foo); // TRUE  
bool b = noexcept(foo2); // FALSE