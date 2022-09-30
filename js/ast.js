// TODO: Improve type system
// TODO: Maybe improve Arrays(lower bound starts from none zero).....

import { app } from './main.js';
import { Error } from './error.js';
import { Function, Return } from './function.js';


class ProgramAST {
    constructor() {
        this.body = [];
    }

    evaluate(env) {
        let result = null;
        for (let node of this.body) {
            result = node.evaluate(env);
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

class FuncDefAST {
    /**
     * 
     * @param {string} ident 
     * @param {array(param)} params 
     * param {id: id, type: type}
     * @param {string} type 
     * @param {array} body 
     */
    constructor(ident, params, type, body) {
        this.ident = ident;
        this.params = params;
        this.type = type;
        this.body = body;
    }

    evaluate(env) {
        // maybe dont pass this.ident in the future
        let func = new Function(this.ident, this.params, this.type, this.body);
        env.define(this.ident, func);
        return;
    }

    dump(prefix) {
        app.terminal.writeln(prefix + 'FuncDefAST: ' + this.ident);
        for (let param of this.params) {
            param.dump(prefix + '  ');
        }
        for (let node of this.body) {
            node.dump(prefix + '  ');
        }
        return;
    }
}

class ReturnAST {
    constructor(expr) {
        this.expr = expr;
    }

    evaluate(env) {
        let value = this.expr.evaluate(env);
        throw new Return(value);
    }

    dump(prefix) {
        app.terminal.writeln(prefix + 'ReturnAST');
        this.expr.dump(prefix + '  ');
        return;
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

    evaluate(env) {
        env.declare_variable(this.ident, this.type);
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

    evaluate(env) {
        // convert upper and lower to number
        env.declare_array(this.ident, this.type, Number(this.lower), Number(this.upper));
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

    evaluate(env) {
        let value = this.expr.evaluate(env);
        env.set_variable(this.ident, value);
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

    evaluate(env) {
        let index = this.index.evaluate(env);
        let value = this.expr.evaluate(env);
        env.set_array(this.ident, index, value);
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

    evaluate(env) {
        if (this.condition.evaluate(env) == true) {
            for (let node of this.body) {
                node.evaluate(env);
            }
        }
        else if (this.else_body != null) {
            for (let node of this.else_body) {
                node.evaluate(env);
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

    evaluate(env) {
        let count = 0;
        while (this.condition.evaluate(env) == true && count < 50100) {
            for (let node of this.body) {
                node.evaluate(env);
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

    evaluate(env) {
        let count = 0;
        let start = this.start.evaluate(env);
        let end = this.end.evaluate(env);
        let step = this.step.evaluate(env);
        if (start < end) {
            for (let i = start; i <= end && count < 50100; i += step) {
                env.set_variable(this.ident, i);
                for (let node of this.body) {
                    node.evaluate(env);
                }
                count++;
            }
        }
        return;
    }

    dump(prefix) {
        app.terminal.writeln(prefix + 'ForAST');
        app.terminal.writeln(prefix + '  ' + this.ident + ' = ' + this.start.evaluate(env) + ' to ' + this.end.evaluate(env) + ' step ' + this.step.evaluate(env));
        for (let node of this.body) {
            node.dump(prefix + '  ');
        }
    }
}

class VarExprAST {
    constructor(ident) {
        this.ident = ident;
    }

    evaluate(env) {
        return env.get_variable(this.ident);
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

    evaluate(env) {
        let index = this.index.evaluate(env);
        return env.get_array(this.ident, index);
    }

    dump(prefix) {
        app.terminal.writeln(prefix + 'ArrExprAST: ' + this.ident);
        this.index.dump(prefix + '  ');
        return;
    }
}


class CallExprAST {
    constructor(ident, args) {
        this.ident = ident;
        this.args = args;
    }

    evaluate(env) {
        let func = env.get_function(this.ident);
        let args = [];
        for (let arg of this.args) {
            args.push(arg.evaluate(env));
        }
        // put arity check into function class in the future
        if (args.length == func.arity()) {
            return func.call(env, args);
        }
        throw new Error("Function '" + this.ident + "' expects " + func.params.length + " arguments");
    }

    dump(prefix) {
        app.terminal.writeln(prefix + 'CallExprAST: ' + this.ident);
        for (let arg of this.args) {
            arg.dump(prefix + '  ');
        }
        return;
    }
}

class UnaryExprAST {
    constructor(op, expr) {
        this.op = op;
        this.expr = expr;
    }

    evaluate(env) {
        let value = this.expr.evaluate(env);
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

    evaluate(env) {
        let lhs = this.lhs.evaluate(env);
        let rhs = this.rhs.evaluate(env);
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

class RndExprAST {
    constructor() {
    }

    evaluate(env) {
        // directly return the number between 0 and 1
        return Math.random();
    }

    dump(prefix) {
        app.terminal.writeln(prefix + 'RndExprAST');
        return;
    }
}

class NumberAST {
    constructor(value) {
        this.value = Number(value);
    }

    evaluate(env) {
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

    evaluate(env) {
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

    evaluate(env) {
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

    evaluate(env) {
        let value = this.expr.evaluate(env);
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
    FuncDefAST,
    ReturnAST,
    VarDeclAST,
    ArrDeclAST,
    VarAssignAST,
    ArrAssignAST,
    IfAST,
    WhileAST,
    ForAST,
    VarExprAST,
    ArrExprAST,
    CallExprAST,
    UnaryExprAST,
    BinaryExprAST,
    RndExprAST,
    NumberAST,
    StringAST,
    BoolAST,
    OutputAST
}
