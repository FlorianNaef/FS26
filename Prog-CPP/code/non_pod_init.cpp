Aclass m;//kein Initialwert
// Vorsicht: Falls "Aclass" gross ist, muss viel kopiert werden
m = otherInstance;

// Copy-Initialisierung fuer non-POD:
Aclass m = otherInstance; //(copy ctor)
Aclass m(otherInstance); // C++-Schreibweise
Aclass m{otherInstance}; // C++-Schreibweise seit c++11

//Besser: direkte Initialisierung auch fuer non-PODs:
Aclass m("Eagle 1", 1, 2, ...); // (vor C++11)
Aclass m{"Eagle 1", 1, 2, ...}; // bevorzugte Schreibw. seit C++11
// Die Instanz wird ohne Umwege mit den gewuenschten Werten in den Speicher geschrieben, sofern ein geeigneter user-defined ctor vorhanden ist!