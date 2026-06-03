; Esempio di estensione R0 = 0x55AA8765

SXTB r1, r0    ; signed extend byte      -> r1 = 0x00000065
SXTH r1, r0    ; signed extend half-word -> r1 = 0xFFFF8765
UXTB r1, r0    ; unsigned extend byte    -> r1 = 0x00000065
UXTH r1, r0    ; unsigned extend half-word -> r1 = 0x00008765