void func(int a = 0, int b = 0, int c = 0){}
func();         // a = 0, b = 0, c = 0
func(1);        // a = 1, b = 0, c = 0
func(1, 1);     // a = 1, b = 1, c = 0
func(1, 1, 1);  // a = 1, b = 1, c = 1
//Alle Funktionsaufrufe valide

void func2(int a, int b = 0, int c = 0); // korrekte Reihenfolge