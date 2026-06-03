; Example: 64Bit Subtraction
LDR  r4, =addrOp     ; load address of int64 array [op1,op2,res]
LDM  r4, {r0-r3}     ; load op1[r1,r0] and op2[r3,r2]
SUBS r0, r0, r2      ; sub lower words and set borrow
SBCS r1, r1, r3      ; sub higher words with borrow in
ADDS r4, #16         ; set r4 to address of res
STM  r4!, {r0-r1}    ; store 64bit result from r0, r1 to res