# tiQ
 Tiny 16bit [fantasy console](https://github.com/topics/fantasy-console) written in TypeScript

## Specifications
* Display: **32x32 Black & White**
* Input: **6 buttons**
* Memory: **8kb** 
* 16 instructions

## Instruction Set _(4 bits)_
0. NOTHING, number
1. LOAD, address
2. SAVE, address

3. ADD, address
4. SUBSTRACT, address

5. EQUAL, address
6. LESS, address
7. GREATER, address
8. AND, address
9. OR, address

10. JUMP, addressToJump
11. TRUE, addressToJump
12. FALSE, addressToJump

13. RANDOM, maximum
14. INPUT, input address
15. DISPLAY, x, y, color

## Assembly Syntax _(TODO)_

61 440

1111 01111 01111 01

65 536


63421 - DRAW, 15, 15, 1
1981 - 15, 15, 1
1981 / 128 = 15

960
1920