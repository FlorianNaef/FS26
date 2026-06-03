friend ostream& operator<<(ostream& os, const TString& s) {
  os << s.getString(); // oder direkter Zugriff auf Attribute
  return os;
}
