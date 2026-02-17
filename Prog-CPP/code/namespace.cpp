void f(); // name in global Namespace (1. f())
namespace A{void f();} // namespace A (2. f())
f(); // f von global Namespace
A::f(); // f von namespace A
using namespace A;
::f(); // 1. f()
f(); // 2. f()