#include <sstream>
#include <iomanip>

std::string formatTime(int h, int m) {
    std::ostringstream buf;
    buf << std::setfill('0') << std::setw(2) << h 
        << ":" << std::setw(2) << m;
    return buf.str();
}
