<p align="center">
	<img src="https://raw.githubusercontent.com/Kirlovon/tiQ/master/assets/logo.png" alt="tiQ Logo" width="256">
</p>

<h3 align="center">tiQ</h3>
<p align="center"><i>Tiny 16bit fantasy console written in TypeScript</i></p>

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

13. RANDOM
14. INPUT, input address
15. DISPLAY, x, y, color

## Assembly Syntax _(TODO)_
* START
* END

* POINT
* GOTO
* DECLARE
* FINISH

* NOTHING
* LOAD
* SAVE
* ADD
* SUBSTRACT
* EQUAL 
* LESS
* GREATER
* AND
* OR
* JUMP
* TRUE
* FALSE
* RANDOM
* INPUT
* DISPLAY
