;Example for 64bit logical shift left
LDR  r2, =data64  ;load address of data64
LDM  r2, {r0-r1}  ;load data64 to r0, r1
LSLS r1, r1, #1   ;logical shift left r1 by 1
MOVS r3, #0       ;r3 = 0
LSLS r0, r0, #1   ;lsl r0 by 1 (carry = b31)
ADCS r1, r3       ;r1 = r1 + 0 + carry
STM  r2!, {r0-r1} ;store r0,r1 in data64