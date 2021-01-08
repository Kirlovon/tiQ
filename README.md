<p align="center">
	<img src="https://raw.githubusercontent.com/Kirlovon/tiQ/master/assets/logo.png" alt="tiQ Logo" width="256">
</p>

<h3 align="center">tiQ</h3>
<p align="center"><i>Tiny 16bit fantasy console written in TypeScript</i></p>

<br>
A simple virtual console I made for training purposes. The project consists of a 16bit virtual machine, compiler, decompiler, CLI and web GUI.
<br>
<br>

## Table of Contents
* [Specifications](#Specifications)
* [Web GUI](#Web-GUI)
* [CLI](#CLI)
* [Instruction Set](#Instruction-Set)
* [Assembly Syntax](#Assembly-Syntax)

<br>

## Specifications
* Display: **32x32 Black & White**
* Input: **6 buttons**
* Supports **16 Instructions**
* Memory: **8kb** *(Can store up to 4096 instructions)*

<br>

## Web GUI

The `/web` folder contains the web gui, through which you can run executable files. Also, GUI available here:

#### [Try it here!](https://kirlovon.dev/tiQ/web/)

The console screen is rendered on Canvas element and the VM logs are printed in the DevTools console. Also, you can interact with the VM by stopping it, executing one step, or starting it up again.

<br>

## CLI

This repository contains a CLI that you can use to compile source code and decompile binary files. Since CLI is written in TypeScript, you need to compile it first, or use `ts-node` utility.

For more information, type:
```
ts-node ./source/cli.ts help
```

_Examples:_
```
ts-node ./source/cli.ts compile source.tiq executable.bin
ts-node ./source/cli.ts decompile executable.bin source.tiq
```

<br>

## Instruction Set

Each instruction consists of **16 bits**. **4 bits** used to store opcode *( type of instruction )*, and other **12 bits** to store arguments.

* Algorithm used for building instructions: `(4096 * opcode) + argument`
* Algorithm for draw instruction: `(4096 * 15) + (128 * x) + (4 * y) + (1 * color)`


#### 0. NOTHING
Store number from 0 to 4095.

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

#### 8. AND, address
Set accumulator value to 1 if the current accumulator and address values are positive _(greater than 0)_. Otherwise, accumulator value will be set to 0.

#### 9. OR, address
Set accumulator value to 1 if the current accumulator and address values equals to 0. Otherwise, accumulator value will be set to 0.

#### 10. JUMP, address
Set the counter _(current execution address)_, to the specified address.
The specified address will be executed on the next tick.

#### 11. TRUE, address
If accumulator value is positive, set the counter to the specified address.
The specified address will be executed on the next tick.

#### 12. FALSE, address
If accumulator value equals to 0, set the counter to the specified address.
The specified address will be executed on the next tick.

#### 13. RANDOM, maximum
Set the accumuator to random number between 0 and the specified maximum.

#### 14. INPUT, key
Set the accumulator to 1 if the specified button is pressed. If not pressed, the accumulator will be set to 0.

#### 15. DISPLAY, x, y, color
Change pixel color on specified coordinates. X and Y arguments must be between 0 and 31. Color argument must be 1 or 0.

<br>

## Assembly Syntax
The best way to write tiQ programs is to use the **tiQ Assembler**, which can be translated into vm instructions using a compiler.

Source code files must have the extension `.tiq`. For executable files it is best to use the `.bin` extension. 

### comments
Compiler supports single line comments. Any text between `//` and the end of the line will be ignored.

### begin & end
Every tiQ program begins and ends with these key words. Anything not in between will be ignored.

_Example:_
```js
Just information, will not be processed

begin
	// Your code goes here
end
```

### finish
Indicates the end of program execution. During compilation this keyword will translate to 0. The result is the same as from `nothing, 0` or just `0`. 

### raw
The compiler supports raw instructions. You can specify an instruction as a number between 0 and 65535.

_Example:_
```js
begin
	0 // Same as finish keyword
	4098 // Same as load, 2 (Since 4096 * 1 + 2 will be 4098)
end
```

### declare, _address_, _value_
You can declare a raw instruction or number at a specified address using the keyword `declare`. All declarations must be at the beginning of the program, since they will be processed only at compilation time. 

_Example:_
```js
begin
	declare, 500, 1000 // Declare number 1000 on address 500
end
```

### :_label_
You can specify the label using the format `:string`. To jump to label address, use the label as an argument instead of the address.

_Example:_
```js
begin
	jump, :here 
	finish // Will not be executed

	:here
	// Your code
end
```

### nothing, _number_
You can declare a number using this keyword. The number must be between 0 and 4095.

_Example:_
```js
begin
	nothing, 100 // Declare number 100
end
```

### load, _address_
Load the number from the specified address into the accumulator.

_Example:_
```js
begin
	declare, 1000, 99
	load, 1000 // Load value from address 1000 (Accumulator will be 99)
end
```

### save, _address_
Save accumulator value to specified address.

### add, _address_
Add a number from the specified address to the accumulator.

### substract, _address_
Subtract from the accumulator the number from the specified address.

### equal, _address_ 
Set accumulator value to 1 if the current accumulator value is the same as the value in the specified address. Otherwise, accumulator value will be set to 0.

### less, _address_
Set accumulator value to 1 if the current accumulator value less than value in the specified address. Otherwise, accumulator value will be set to 0.

### greater, _address_
Set accumulator value to 1 if the current accumulator value greater than value in the specified add

### and, _address_
Set accumulator value to 1 if the current accumulator and address values are positive _(greater than 0)_. Otherwise, accumulator value will be set to 0.

### or, _address_
Set accumulator value to 1 if the current accumulator and address values equals to 0. Otherwise, accumulator value will be set to 0.

### jump, _address / label_
Set the counter _(current execution address)_, to the specified address or label.
The specified address will be executed on the next tick.

_Example:_
```js
begin
	:start
	jump, :here
	nothing, 0 // Never will be executed

	:here
	jump, 0 // Jump to start label, because 0 is the beginning of the code.
end
```

### true, _address / label_
Same as jump, but will be executed only when current accumulator value is positive _(greater than 0)_.

### false, _address / label_
Same as jump, but will be executed only when current accumulator value equals to 0.

### random, _maximum_
Set the accumuator to random number between 0 and the specified maximum. Maximal possible value is 4095.

### input, _key_
Set the accumulator to 1 if the specified button is pressed. If not pressed, the accumulator will be set to 0.

_Possible keys:_
* **0** - arrow up.
* **1** - arrow down.
* **2** - arrow left.
* **3** - arrow right.
* **4** - key Z.
* **5** - key X.
* **6** - _unused_
* **7** - _unused_

### display, _x_, _y_, _color_
Change pixel color on specified coordinates. X and Y arguments must be between 0 and 31. Color argument must be 1 or 0.

_Example:_
```js
begin
	display, 0, 0, 1 // Set top left pixel to black
	display, 31, 31, 1 // Set bottom right pixel to black
end
```
