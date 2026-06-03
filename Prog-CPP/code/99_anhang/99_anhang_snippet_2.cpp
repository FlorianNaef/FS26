#include <format>

std::string formatTime(int h, int m) {
    // :02 significa 2 cifre con riempimento zero
    return std::format("{:02}:{:02}", h, m);
}
