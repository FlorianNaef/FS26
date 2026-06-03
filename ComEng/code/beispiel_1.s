LDR   R0, =G2
LDR   R1, =G1
LDRH  R0, [R0]   ;R0 <- G2
SXTH  R0, R0
LDR   R1, [R1]   ;R1 <- G1
CMP   R0, R1     ;G2-G1
BGE   else_if
then:
BL    foo_one
B     endif
else_if:
CMP   R0, R1
BLE   else
BL    foo_two
B     endif
else:
BL    foo_three
endif: