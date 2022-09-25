# The CAIE pseudocode web interpreter

Provides an online web editor for CAIE Pseudocode, with syntax highlighting, and a javascript-based interpreter for the language.
Website URL: [The web interpreter](https://ulweb.club)

## Syntax
Below are some basic examples of the syntax of the language.
1. Variable declaration
    ```
    DECLARE <Identifier>: <Type>
    ```
2. Variable assignment
    ```
    <Identifier> <- <Expression>
    ```
3. Array declaration
    ```
    DECLARE <Identifier>: ARRAY[0:<Size>] OF <Type>
    ```
4. Array assignment
    ```
    <Identifier>[<Index>] <- <Expression>
    ```
5. If statement
    ```
    IF <Expression> THEN
        <Statements>
    ELSE
        <Statements>
    ENDIF
    ```
6. While loop
    ```
    WHILE <Expression>
        <Statements>
    ENDWHILE
    ```
7. For loop
    ```
    FOR <Identifier> <- <Expression> TO <Expression>
        <Statements>
    ENDFOR
    ```
8. Output statement
    ```
    OUTPUT <Expression>
    ```

## Features to implement
- [ ] Functions & Procedures
- [ ] Struct & Pointer
- [ ] Optimise the interpreter
- [ ] File operations

## Some differences from the original CAIE pseudocode
- Only supports Array with the lower boundary of 0. (e.g. `ARRAY[0:10] OF INTEGER`) ~~Personally I think it is stupid to start an array from non-zero index.~~

## Interpreter
The interpreter is written in javascript. It is simply a tree-walk interpreter using LL(1) parsing, with a few optimizations. The interpreter is not very efficient, and is not intended for production use. It is only intended for educational purposes.
The editor uses the monaco editor for the editing system and uses xterm.js to setup a fake terminal for the IO system.

## Contributing
Contributions are welcome. Please open an issue or a pull request if you would like to contribute.