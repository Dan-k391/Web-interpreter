import { Error } from "./error.js";


const WHITESPACE = /\s/;
const NUMBERS = /[0-9]/;
const SINGLEOPERATORS = /[+\-*/()\[\]=<>:,&]/;
const DOUBLEOPERATORS = ['<-', '<=', '>=', '<>'];
const LETTERS = /[a-z]/i;
const BOOLEANS = ['TRUE', 'FALSE'];
// built-in functions are also combined in KEYWORDS
const KEYWORDS = ['FUNCTION', 'ENDFUNCTION', 'PROCEDURE', 'ENDPROCEDURE', 'RETURNS', 'RETURN', 'CALL',
                  'DECLARE', 'ARRAY', 'OF',
                  'IF', 'THEN', 'ELSE', 'ENDIF', 'WHILE', 'ENDWHILE', 'FOR', 'TO', 'STEP', 'NEXT', 'MOD', 'AND', 'OR', 'NOT',
                  'OUTPUT', 'INPUT', 'RND'];
const TYPES = ['INTEGER', 'REAL', 'CHAR', 'STRING', 'BOOLEAN'];

class Scanner {
    constructor(input) {
        this.input = input;
        this.current_line = 1;
    }

    scan() {
        let all_tokens = [];
        let lines = this.input.split('\n');
        for (let line of lines) {
            let tokens = this.tokenize_line(line);
            all_tokens.push(...tokens);
            this.current_line++;
        }
        if (all_tokens.length != 0) 
            return all_tokens;
        return null;
    }

    tokenize_line(line) {
        let current = 0;
        let tokens = [];
        while (current < line.length) {
            let char = line[current];

            // if the line is a comment
            if (char == '/' && line[current + 1] == '/') {
                return tokens;
            }
            else if (WHITESPACE.test(char)) {
                current++;
                continue;
            }
            else if (SINGLEOPERATORS.test(char)) {
                if (DOUBLEOPERATORS.includes(char + line[current + 1])) {
                    current += 2;
                    // line[current - 1] because current has already been incremented
                    tokens.push({ type: 'operator', value: char + line[current - 1], line: this.current_line, start_column: current - 2, end_column: current });
                    continue;
                }

                current++;
                tokens.push({ type: 'operator', value: char, line: this.current_line, start_column: current - 1, end_column: current });
                continue;
            }
            else if (LETTERS.test(char) || char == '_') {
                let value = '';

                while ((LETTERS.test(char) || NUMBERS.test(char) || char == '_') && current < line.length) {
                    value += char;
                    char = line[++current];
                }

                if (TYPES.includes(value)) {
                    tokens.push({ type: 'type', value: value, line: this.current_line, start_column: current - value.length, end_column: current });
                }
                else if (BOOLEANS.includes(value)) {
                    tokens.push({ type: 'boolean', value: value, line: this.current_line, start_column: current - value.length, end_column: current });
                }
                else if (KEYWORDS.includes(value)) {
                    tokens.push({ type: value.toLowerCase(), value: value, line: this.current_line, start_column: current - value.length, end_column: current });
                }
                else {
                    tokens.push({ type: 'identifier', value: value, line: this.current_line, start_column: current - value.length, end_column: current });
                }
                continue;
            }
            // if the line is a number
            else if (NUMBERS.test(char)) {
                let value = '';
                let dot = false;

                while (current < line.length) {
                    if (char == '.') {
                        if (dot) {
                            throw new Error('Invalid number', this.current_line, current - value.length, current);
                        }
                        dot = true;
                    }
                    else if (!NUMBERS.test(char)) {
                        break;
                    }
                    value += char;
                    char = line[++current];
                }

                tokens.push({ type: 'number', value: value, line: this.current_line, start_column: current - value.length, end_column: current });
                continue;
            }
            else if (char == '"') {
                let value = '';
                char = line[++current];

                while (char != '"' && current < line.length) {
                    value += char;
                    char = line[++current];
                }
                if (current == line.length) {
                    throw new Error('Unterminated string', this.current_line, current - value.length - 2, current);
                }
                else {
                    current++;
                    tokens.push({ type: 'string', value: value, line: this.current_line, start_column: current - value.length - 2, end_column: current });
                }
            }
            else if (char == "'") {
                let value = '';
                char = line[++current];

                while (char != "'" && current < line.length) {
                    value += char;
                    char = line[++current];
                }
                if (current == line.length) {
                    throw new Error('Unterminated char', this.current_line, current - value.length - 2, current);
                }
                else if (value.length > 1) {
                    throw new Error('Char must be a single character', this.current_line, current - value.length - 2, current);
                }
                else {
                    current++;
                    tokens.push({ type: 'char', value: value, line: this.current_line, start_column: current - value.length - 2, end_column: current });
                }
            }
            else {
                throw new Error('Unexpected character', this.current_line, current, current + 1);
            }
        }
        return tokens;
    }
}

const all_keywords = [...BOOLEANS, ...TYPES, ...KEYWORDS];

export {
    Scanner,
    all_keywords
}
