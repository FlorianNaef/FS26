Unterklasse::unterklasse(int _initvalOberklasse, 
                         int _initvallUnterklasse):
    Oberklasse{_initvalOberklasse},// muss zuerst stehen da diese zuerst initialisiert werden muss
    unterklassenAttribut{_initvallUnterklasse}
{} // bleibt leer