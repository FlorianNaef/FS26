#include <vector>
std::vector<dt> v;// Template instanzieren mit <datentyp> (dt)
v.push_back("Value");// Value anfuegen
v.erase("iterator");// Elemente loeschen(Iterator=fancy Pointer)
v.begin();// returned ein Pointer auf das erste element
v.end();// returnd ein Pointer HINTER das letzte Element

for (const dt s : v) { // Iteriert ueber Elemente vom Vector
    doSomething(s);} // do something mit element

for (std::vector<dt>::iterator it=v.begin();it!=v.end();it++) {
    doSomething(s);} // do something mit element, altes for
