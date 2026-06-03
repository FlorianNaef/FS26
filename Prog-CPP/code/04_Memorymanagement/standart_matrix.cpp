template <typename T, std::size_t m, std::size_t n>
void printMatrix(const std::array<std::array<T, m>, n>& matrix) {
  for (std::size_t i = 0; i < matrix.size(); ++i) { 
    for (std::size_t j = 0; j < matrix[i].size(); ++j) { 
      std::cout << matrix[i][j] << " ";
    }
    std::cout << std::endl;
  }
}
  
int main() {
  // Definizione di una matrice 2x3 (2 righe, 3 colonne)
  std::array<std::array<int, 3>, 2> matrix = {
  {{1, 2, 3},  // Riga 0
  {4, 5, 6}}}; // Riga 1, ATTENZIONE Doppia }}
}