# tiQ
 Tiny virtual machine written in TypeScript


## Instruction Set
* NOTHING, 0, (4096)

* LOAD_A, 1, (4096)
* SAVE_A, 2, (4096)
* SET_A, 3, (4096)

* LOAD_B, 4, (4096)
* SAVE_B, 5, (4096)
* SET_B, 6, (4096)

* ADD, 7, (4096)
* SUBSTRACT, 8, (4096)

* EQUAL, 9, (4096)
* LESS, 10, (4096)
* GREATER, 11, (4096)
* GOTO, 12, (4096)

* INPUT, 13, (8, )
* GPU0, 14, (4096)
* GPU1, 15, (4096)


## Tiny version

* NOTHING, 0, (8192)
* READ, 1 (8192)
* WRITE, 2 (8192)
* SET, 3 (8192)
* ADD, 4 (8192)
* SUBSTRACT, 5 (8192)
* ZERO, 6 (8192)
* GOTO, 7 (8192)


16 - 65536
15 - 32768
14 - 16384
13 - 8192
12 - 4096
11 - 2048
10 - 1024
9 - 512
8 - 256
7 - 128
6 - 64
5 - 32
4 - 16
3 - 8
2 - 4
1 - 1