#include <stdexcept> // For most runtime errors

int main() {
  int x;
  std::cin >> x;
  try {
    a(x); // 'a' can throw various types of exceptions
  } catch (const char* e) {
    std::clog << e << std::endl; // handling Type const char*
  } catch (const std::range_error& e) {
    std::cerr << i << std::endl; // handling range_error
  } catch (const std::runtime_error& e) {
    std::cerr << i << std::endl; // handling runtime_error
  } catch (...) {
    // handling everything
    std::cerr << "other exception occured" << std::endl;
  }
return 0;}