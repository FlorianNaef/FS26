int i = 42;

// myref ist eine Referenz auf i:
int& myref = i;

// kann auch bei einem Funktionsaufruf verwendet werden:
void myfunc(const DaClass& in1,int& in2);
// hier werden in1& 2 als referenz uebergeben. "DaClass" ist hier auch Schreibgeschuetzt (wie ein constpointer) 