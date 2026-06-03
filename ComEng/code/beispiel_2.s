LDR   R0, =G1
LDR   R0, [R0]     ;R0 <- G1
MOVS  R1, #4       ;R1 = 4
CMN   R0, R1       ;G1-(-4)
BLE   else
CMP   R0, R1       ;G1-4
BGT   else
then:
BL    foo_one
B     endif
else:
BL    foo_two
endif: