;Example: 64Bit Addition
LDR  r4, =addrOp ;load address of int64 array [op1,op2,res]
LDM  r4, {r0-r3} ;load op1[r1,r0] and op2[r2,r3]
ADDS r0, r0, r1  ;add lower words and set carry
ADCS r1, r2, r3  ;add higher words with carry in
ADDS r4, #8      ;set r4 to address of res
STM  r4, {r0-r1} ;store 64bit result from r0, r1 to res