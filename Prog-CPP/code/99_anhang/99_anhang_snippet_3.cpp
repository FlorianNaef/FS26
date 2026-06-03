#include  <cmath>

bool areEqual(double a, double b) {
    static constexpr double epsilon = 1e-9;
    return fabs(a - b) < epsilon;}
