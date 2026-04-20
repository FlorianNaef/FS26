class B {
  public:
    virtual void foo1();
    virtual void foo2();
    void foo3();
  };

class D: public B {
  public:
    virtual foo1() override;
    virtual void foo4();
  };