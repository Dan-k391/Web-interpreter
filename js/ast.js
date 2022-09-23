// TODO: Improve type system
// TODO: Maybe improve Arrays(lower bound starts from none zero).....

import { app } from './main.js';
import { Variable, Array } from './type.js';
import { Error } from './error.js';

var named_values = {};
var named_arrays = {};

class ProgramAST {
    constructor() {
        this.body = [];
    }

    evaluate() {
        let result = null;
        for (let node of this.body) {
            result = node.evaluate();
        }
        return result;
    }

    dump(prefix) {
        app.terminal.writeln(prefix + 'ProgramAST');
        for (let node of this.body) {
            node.dump(prefix + '  ');
        }
        return;
    }
    
    stop() {
        throw new Error('User stopped the program');
    }
}

class VarDeclAST {
    constructor(ident, type) {
        this.ident = ident;
        if (type == 'INTEGER' || type == 'REAL') {
            this.type = 'number';
        }
        else if (type == 'STRING' || type == 'CHAR') {
            this.type = 'string';
        }
        else if (type == 'BOOLEAN') {
            this.type = 'boolean';
        }
    }

    evaluate() {
        named_values[this.ident] = new Variable(this.type);
        return;
    }

    dump(prefix) {
        app.terminal.writeln(prefix + 'VarDeclAST ' + this.ident + ' ' + this.type);
        return;
    }
}

class ArrDeclAST {
    constructor(ident, type, lower, upper) {
        this.ident = ident;
        if (type == 'INTEGER' || type == 'REAL') {
            this.type = 'number';
        }
        else if (type == 'STRING' || type == 'CHAR') {
            this.type = 'string';
        }
        else if (type == 'BOOLEAN') {
            this.type = 'boolean';
        }
        this.lower = lower;
        this.upper = upper;
    }

    evaluate() {
        named_arrays[this.ident] = new Array(this.type, this.lower, this.upper);
        return;
    }

    dump(prefix) {
        app.terminal.writeln(prefix + 'ArrayDeclAST ' + this.ident + ' ' + this.type + ' ' + this.lower + '-' + this.upper);
        return;
    }
}


class VarAssignAST {
    constructor(ident, expr) {
        this.ident = ident;
        this.expr = expr;
    }

    evaluate() {
        let value = this.expr.evaluate();
        if (this.ident in named_values) {
            if (typeof(value) == named_values[this.ident].type)
                named_values[this.ident].value = value;
            else
                throw new Error('Type mismatch in assignment for Variable ' + this.ident);
        }
        else {
            throw new Error("Variable '" + this.ident + "' is not declared");
        }
        return;
    }

    dump(prefix) {
        app.terminal.writeln(prefix + 'VarAssignAST: ' + this.ident);
        this.expr.dump(prefix + '  ');
        return;
    }
}


class ArrAssignAST {
    constructor(ident, index, expr) {
        this.ident = ident;
        this.index = index;
        this.expr = expr;
    }

    evaluate() {
        let index = this.index.evaluate();
        let value = this.expr.evaluate();
        if (this.ident in named_arrays) {
            if (typeof(index) == 'number' && index >= named_arrays[this.ident].lower && index <= named_arrays[this.ident].upper) {
                if (typeof(value) == named_arrays[this.ident].type)
                    named_arrays[this.ident].values[index] = value;
                else
                    throw new Error('Type mismatch in assignment for Array ' + this.ident);
            }
            else
                throw new Error('Index out of bounds for Array ' + this.ident);
        }
        else {
            throw new Error("Array '" + this.ident + "' is not declared");
        }
        return;
    }

    dump(prefix) {
        app.terminal.writeln(prefix + 'ArrAssignAST: ' + this.ident);
        this.index.dump(prefix + '  ');
        this.expr.dump(prefix + '  ');
        return;
    }
}

class IfAST {
    constructor(condition, body, else_body = null) {
        this.condition = condition;
        this.body = body;
        this.else_body = else_body;
    }

    evaluate() {
        if (this.condition.evaluate() == true) {
            for (let node of this.body) {
                node.evaluate();
            }
        }
        else if (this.else_body != null) {
            for (let node of this.else_body) {
                node.evaluate();
            }
        }
        return;
    }

    dump(prefix) {
        app.terminal.writeln(prefix + 'IfAST');
        this.condition.dump(prefix + '  ');
        for (let node of this.body) {
            node.dump(prefix + '  ');
        }
        if (this.else_body != null) {
            app.terminal.writeln(prefix + 'Else');
            for (let node of this.else_body) {
                node.dump(prefix + '  ');
            }
        }
        return;
    }
}

class WhileAST {
    constructor(condition, body) {
        this.condition = condition;
        this.body = body;
    }

    evaluate() {
        let count = 0;
        while (this.condition.evaluate() == true && count < 50100) {
            for (let node of this.body) {
                node.evaluate();
            }
            count++;
        }
        return;
    }

    dump(prefix) {
        app.terminal.writeln(prefix + 'WhileAST');
        this.condition.dump(prefix + '  ');
        for (let node of this.body) {
            node.dump(prefix + '  ');
        }
    }
}

class ForAST {
    constructor(ident, start, end, body, step = new NumberAST(1)) {
        this.ident = ident;
        this.start = start;
        this.end = end;
        this.body = body;
        // put step at last so default        
        this.step = step;
    }

    evaluate() {
        let count = 0;
        let start = this.start.evaluate();
        let end = this.end.evaluate();
        let step = this.step.evaluate();
        if (start < end) {
            for (let i = start; i <= end && count < 50100; i += step) {
                named_values[this.ident].value = i;
                for (let node of this.body) {
                    node.evaluate();
                }
                count++;
            }
        }
        return;
    }

    dump(prefix) {
        app.terminal.writeln(prefix + 'ForAST');
        app.terminal.writeln(prefix + '  ' + this.ident + ' = ' + this.start.evaluate() + ' to ' + this.end.evaluate() + ' step ' + this.step.evaluate());
        for (let node of this.body) {
            node.dump(prefix + '  ');
        }
    }
}

class VarExprAST {
    constructor(ident) {
        this.ident = ident;
    }

    evaluate() {
        if (this.ident in named_values && named_values[this.ident].value != null) 
            return named_values[this.ident].value;
        throw new Error("Variable '" + this.ident + "' is not defined");
    }

    dump(prefix) {
        app.terminal.writeln(prefix + 'VarExprAST: ' + this.ident);
        return;
    }
}

class ArrExprAST {
    constructor(ident, index) {
        this.ident = ident;
        this.index = index;
    }

    evaluate() {
        if (this.ident in named_arrays && named_arrays[this.ident].values != null) {
            let index = this.index.evaluate();
            if (index >= named_arrays[this.ident].lower && index <= named_arrays[this.ident].upper) {
                let value = named_arrays[this.ident].values[index];
                console.log(value);
                return value;
            }
            else
                throw new Error("Array index out of bounds");
        }
        throw new Error("Array '" + this.ident + "' is not defined");
    }

    dump(prefix) {
        app.terminal.writeln(prefix + 'ArrExprAST: ' + this.ident);
        this.index.dump(prefix + '  ');
        return;
    }
}

class UnaryExprAST {
    constructor(op, expr) {
        this.op = op;
        this.expr = expr;
    }

    evaluate() {
        let value = this.expr.evaluate();
        if (value == null)
            return null
        if (this.op == '+' || this.op == '-') {
            if (typeof(value) == 'number') {
                if (this.op == '+') {
                    return value;
                }
                else {
                    return -value;
                }
            }
            else
                throw new Error('Type mismatch in unary expression');
        }
        else if (this.op == 'NOT') {
            if (typeof(value) == 'boolean')
                return !value;
            else
                throw new Error('Type mismatch in unary expression');
        }
        return null;
    }

    dump(prefix) {
        app.terminal.writeln(prefix + 'UnaryExprAST: ' + this.op);
        this.expr.dump(prefix + '  ');
        return;
    }
}

class BinaryExprAST {
    constructor (op, lhs, rhs) {
        this.op = op;
        this.lhs = lhs;
        this.rhs = rhs;
    }

    evaluate() {
        let lhs = this.lhs.evaluate();
        let rhs = this.rhs.evaluate();
        if (lhs == null && rhs == null)
            return null
        if (this.op == '+' || this.op == '-' || this.op == '*' || this.op == '/') {
            if (typeof(lhs) == 'number' && typeof(rhs) == 'number') {
                if (this.op == '+')
                    return lhs + rhs;
                else if (this.op == '-')
                    return lhs - rhs;
                else if (this.op == '*')
                    return lhs * rhs;
                else if (this.op == '/')
                    return lhs / rhs;
            }
            else
                throw new Error('Type mismatch in binary expression');
        }
        else if (this.op == 'AND' || this.op == 'OR') {
            if (typeof(lhs) == 'boolean' && typeof(rhs) == 'boolean') {
                if (this.op == 'AND')
                    return lhs && rhs;
                else if (this.op == 'OR')
                    return lhs || rhs;
            }
            else
            throw new Error('Type mismatch in binary expression');
        }
        else if (this.op == '=' || this.op == '<>' || this.op == '<' || this.op == '<=' || this.op == '>' || this.op == '>=') {
            if (typeof(lhs) == typeof(rhs)) {
                if (this.op == '=')
                    return lhs == rhs;
                else if (this.op == '<>')
                    return lhs != rhs;
                else if (this.op == '<')
                    return lhs < rhs;
                else if (this.op == '<=')
                    return lhs <= rhs;
                else if (this.op == '>')
                    return lhs > rhs;
                else if (this.op == '>=')
                    return lhs >= rhs;
            }
            else
            throw new Error('Type mismatch in binary expression');
        }
        return null;
    }

    dump(prefix) {
        app.terminal.writeln(prefix + 'BinaryExprAST: ' + this.op);
        this.lhs.dump(prefix + '  ');
        this.rhs.dump(prefix + '  ');
        return;
    }
}

class NumberAST {
    constructor(value) {
        this.value = Number(value);
    }

    evaluate() {
        return this.value;
    }

    dump(prefix) {
        app.terminal.writeln(prefix + 'NumberAST: ' + this.value.toString());
        return;
    }
}

class StringAST {
    constructor(value) {
        this.value = value;
    }

    evaluate() {
        return this.value;
    }

    dump(prefix) {
        app.terminal.writeln(prefix + 'StringAST: ' + this.value);
        return;
    }
}

class BoolAST {
    constructor(value) {
        if (value == 'TRUE')
            this.value = true;
        else
            this.value = false;
    }

    evaluate() {
        return this.value;
    }

    dump(prefix) {
        app.terminal.writeln(prefix + 'BoolAST: ' + this.value);
        return;
    }
}

class OutputAST {
    constructor(expr) {
        this.expr = expr;
    }

    evaluate() {
        let value = this.expr.evaluate();
        if (value != null)
            app.terminal.writeln(value.toString());
        return;
    }

    dump(prefix) {
        app.terminal.writeln(prefix + 'OutputAST');
        this.expr.dump(prefix + '  ');
        return;
    }
}

export {
    ProgramAST,
    VarDeclAST,
    ArrDeclAST,
    VarAssignAST,
    ArrAssignAST,
    IfAST,
    WhileAST,
    ForAST,
    VarExprAST,
    ArrExprAST,
    UnaryExprAST,
    BinaryExprAST,
    NumberAST,
    StringAST,
    BoolAST,
    OutputAST
}
