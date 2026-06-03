// Template-Definition fuer Funktionsdeklaration:
template<typename type1, typename type2, ...>
returntype name(type1 param1, type2 param2 , ...);
// Inline goes before returntype

// Template-Definition fuer Funktionsdefinition:
template<typename type1, typename type2, ...>
returntype name(type1 param1, type2 param2 , ...) { ... }

// Klassentemplate:
// Template-Definition fuer Klassendeklaration:
template<typename type1, typename type2, ...>
class Classname{ ... };

// Template-Definition fuer Methode einer Klasse:
template<typename T1, typename T2, ...>
returntype Class-name<T1, T2, ...>::method-name(type1 param1, type2 param2 , ... ) { ... };