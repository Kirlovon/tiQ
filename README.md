<p align="center">
	<img src="https://raw.githubusercontent.com/Kirlovon/tiQ/master/assets/logo.png" alt="tiQ Logo" width="256">
</p>

<h3 align="center">tiQ</h3>
<p align="center"><i>Tiny 16bit fantasy console written in TypeScript</i></p>

<br>
A simple virtual console I made for training purposes. The project consists of a 16bit virtual machine, compiler, decompiler, CLI and web GUI.
<br>
<br>

## Specifications
* Display: **32x32 Black & White**
* Input: **6 buttons**
* Supported **16 Instructions**
* Memory: **8kb** *( Can store up to 4096 instructions )*

<br>

## Instruction Set

Each instruction consists of **16 bits**. **4 bits** used to store opcode *( type of instruction )*, and other **12 bits** to store arguments.

* Algorithm used for building instructions: `(4096 * opcode) + argument`
* Algorithm for draw instruction: `(4096 * 15) + (128 * x) + (4 * y) + (1 * color)`

<br>

#### 0. NOTHING
Store number from 0 to 4095.

Example: `4095` _( stores number 4095 )_

#### 1. LOAD, address
Load the number from the specified address into the accumulator.

#### 2. SAVE, address
Save accumulator value to specified memory address.

#### 3. ADD, address
Add a number from the specified address to the accumulator.

#### 4. SUBSTRACT, address
Subtract from the accumulator the number from the specified address.

#### 5. EQUAL, address
Set accumulator value to 1 if the current accumulator value is the same as the value in the specified address. Otherwise, accumulator value will be set to 0.

#### 6. LESS, address
Set accumulator value to 1 if the current accumulator value less than value in the specified address. Otherwise, accumulator value will be set to 0.

#### 7. GREATER, address
Set accumulator value to 1 if the current accumulator value greater than value in the specified address. Otherwise, accumulator value will be set to 0.

8. AND, address
9. OR, address

10. JUMP, addressToJump
11. TRUE, addressToJump
12. FALSE, addressToJump

13. RANDOM, maximum

14. INPUT, key

#### 15. DISPLAY, x, y, color
Change pixel color on specified coordinates. X and Y arguments must be between 0 and 31. Color argument must be 1 or 0.

<br>

## Assembly Syntax _(TODO)_
* begin
* end

* finish
* raw
* declare
* label

* nothing

* load
* save
* add
* substract

* equal 
* less
* greater
* and
* or

* jump
* true
* false

* random
* input
* display
