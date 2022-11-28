// TODO: Improve type system
// TODO: Maybe improve Arrays(lower bound starts from none zero).....
// TODO: Change to stack 

import { app } from './main.js';
import { RuntimeError } from './error.js';
import { Return } from './function.js';


class ProgramAST {
    constructor() {
        this.body = [];
    }

    evaluate(env) {
        for (let node of this.body) {
            node.evaluate(env);
        }
    }

    dump(prefix) {
        app.terminal.writeln('');
        app.terminal.writeln(prefix + '\x1b[36;1mProgramAST\x1b[0m');
        for (let node of this.body) {
            node.dump(prefix + '  ');
        }
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
        this.type = type.toLowerCase();
        this.body = body;
    }

    evaluate(env) {
        // maybe dont pass this.ident in the future
        // no, pass it
        env.define_function(this.ident, this.params, this.type, this.body);
    }

    dump(prefix) {
        app.terminal.writeln(prefix + '\x1b[31;1mFuncDefAST\x1b[0m: ' + this.ident);
        for (let param of this.params) {
            param.dump(prefix + '  ');
        }
        for (let node of this.body) {
            node.dump(prefix + '  ');
        }
    }
}

class ProcDefAST {
    constructor(ident, params, body) {
        this.ident = ident;
        this.params = params;
        this.body = body;
    }

    evaluate(env) {
        env.define_procedure(this.ident, this.params, this.body);
    }

    dump(prefix) {
        app.terminal.writeln(prefix + '\x1b[31;1mProcDefAST\x1b[0m: ' + this.ident);
        for (let param of this.params) {
            param.dump(prefix + '  ');
        }
        for (let node of this.body) {
            node.dump(prefix + '  ');
        }
    }
}

class ReturnAST {
    constructor(expr) {
        this.expr = expr;
    }

    evaluate(env) {
        let value = this.expr.evaluate(env);
        // check in value is implemented in function.js
        throw new Return(value);
    }

    dump(prefix) {
        app.terminal.writeln(prefix + '\x1b[31;1mReturnAST\x1b[0m');
        this.expr.dump(prefix + '  ');
    }
}


class VarDeclAST {
    constructor(ident, type) {
        this.ident = ident;
        this.type = type.toLowerCase();
    }

    evaluate(env) {
        env.declare_variable(this.ident, this.type);
    }

    dump(prefix) {
        app.terminal.writeln(prefix + '\x1b[31;1mVarDeclAST\x1b[0m ' + this.ident + ': ' + this.type);
        
    }
}

class ArrDeclAST {
    constructor(ident, type, lower, upper) {
        this.ident = ident;
        this.type = type.toLowerCase();
        this.lower = lower;
        this.upper = upper;
    }

    evaluate(env) {
        // convert upper and lower to number
        // i just did not find this bug before holy shit!!!
        let lower = this.lower.evaluate(env);
        let upper = this.upper.evaluate(env);
        env.declare_array(this.ident, this.type, lower, upper);
    }

    dump(prefix) {
        app.terminal.writeln(prefix + '\x1b[31;1mArrDeclAST\x1b[0m ' + this.ident + ': ' + this.type + '[' + this.lower + '-' + this.upper + ']');
    }
}

class TypeDefAST {
    constructor(ident, body) {
        this.ident = ident;
        // body is already [VarDeclAST]
        this.body = body;
    }

    evaluate(env) {
        env.define_type(this.ident, this.body);
    }

    dump(prefix) {
        app.terminal.writeln(prefix + '\x1b[31;1mFuncDefAST\x1b[0m ' + this.ident);
        for (let node of this.body) {
            node.dump(prefix + '  ');
        }
    }
}

class TypeVarDeclAST {
    constructor(ident, type) {
        this.ident = ident;
        // type is the name of the type
        this.type = type;
    }

    evaluate(env) {
        env.declare_typevar(this.ident, this.type);
    }

    dump(prefix) {
        app.terminal.writeln(prefix + '\x1b[31;1mTypeVarDeclAST\x1b[0m ' + this.ident + ' ' + this.type);
    }
}

class TypeArrDeclAST {
    constructor(ident, type, lower, upper) {
        this.ident = ident;
        this.type = type;
        this.lower = lower;
        this.upper = upper;
    }

    evaluate(env) {
        let lower = this.lower.evaluate(env);
        let upper = this.upper.evaluate(env);
        env.declare_typearr(this.ident, this.type, lower, upper);
    }

    dump(prefix) {
        app.terminal.writeln(prefix + 'TypeArrDeclAST ' + this.ident + ' ' + this.type + ' ' + this.lower + '-' + this.upper);
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
    }

    dump(prefix) {
        app.terminal.writeln(prefix + '\x1b[31;1mVarAssignAST\x1b[0m ' + this.ident);
        this.expr.dump(prefix + '  ');
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
    }

    dump(prefix) {
        app.terminal.writeln(prefix + '\x1b[31;1mArrAssignAST\x1b[0m ' + this.ident);
        this.index.dump(prefix + '  ');
        this.expr.dump(prefix + '  ');
    }
}

class TypeVarAssignAST {
    constructor(ident, var_name, expr) {
        this.ident = ident;
        this.var_name = var_name;
        this.expr = expr;
    }

    evaluate(env) {
        let value = this.expr.evaluate(env);
        env.set_typevar(this.ident, this.var_name, value);
    }

    dump(prefix) {
        app.terminal.writeln(prefix + 'TypeVarAssignAST: ' + this.ident + ' ' + this.var_name);
        this.expr.dump(prefix + '  ');
    }
}

class TypeArrAssignAST {
    constructor(ident, index, var_name, expr) {
        this.ident = ident;
        this.index = index;
        this.var_name = var_name;
        this.expr = expr;
    }

    evaluate(env) {
        let index = this.index.evaluate(env);
        let value = this.expr.evaluate(env);
        env.set_typearr(this.ident, index, this.var_name, value);
    }

    dump(prefix) {
        app.terminal.writeln(prefix + 'TypeArrAssignAST: ' + this.ident + ' ' + this.var_name);
        this.index.dump(prefix + '  ');
        this.expr.dump(prefix + '  ');
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
        
    }

    dump(prefix) {
        app.terminal.writeln(prefix + '\x1b[31;1mIfAST\x1b[0m');
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
        
    }

    dump(prefix) {
        app.terminal.writeln(prefix + '\x1b[31;1mWhileAST\x1b[0m');
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
        
    }

    dump(prefix) {
        app.terminal.writeln(prefix + '\x1b[31;1mForAST\x1b[0m');
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
        app.terminal.writeln(prefix + '\x1b[33;1mVarExprAST\x1b[0m: ' + this.ident);
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
        app.terminal.writeln(prefix + '\x1b[33;1mArrExprAST\x1b[0m: ' + this.ident);
        this.index.dump(prefix + '  ');
    }
}

class TypeVarExprAST {
    constructor(ident, var_name) {
        this.ident = ident;
        this.var_name = var_name;
    }

    evaluate(env) {
        return env.get_typevar(this.ident, this.var_name);
    }

    dump(prefix) {
        app.terminal.writeln(prefix + 'TypeVarExprAST: ' + this.ident + ' ' + this.var_name);
    }
}

class TypeArrExprAST {
    constructor(ident, index, var_name) {
        this.ident = ident;
        this.index = index;
        this.var_name = var_name;
    }

    evaluate(env) {
        let index = this.index.evaluate(env);
        return env.get_typearr(this.ident, index, this.var_name);
    }

    dump(prefix) {
        app.terminal.writeln(prefix + 'TypeArrExprAST: ' + this.ident + ' ' + this.var_name);
        this.index.dump(prefix + '  ');
    }
}

class CallFuncExprAST {
    constructor(ident, args) {
        this.ident = ident;
        this.args = args;
    }

    evaluate(env) {
        let func = env.get_function(this.ident);
        let args = [];
        for (let arg of this.args) {
            let value = arg.evaluate(env);
            args.push(value);
        }
        // put arity check into function class in the future
        if (args.length == func.arity()) {
            return func.call(env, args);
        }
        throw new RuntimeError("Function '" + this.ident + "' expects " + func.params.length + " arguments");
    }

    dump(prefix) {
        app.terminal.writeln(prefix + '\x1b[33;1mCallFuncExprAST\x1b[0m: ' + this.ident);
        for (let arg of this.args) {
            arg.dump(prefix + '  ');
        }
    }
}


class CallProcExprAST {
    constructor(ident, args) {
        this.ident = ident;
        this.args = args;
    }

    evaluate(env) {
        let proc = env.get_procedure(this.ident);
        let args = [];
        for (let arg of this.args) {
            let value = arg.evaluate(env);
            args.push(value);
        }
        if (args.length == proc.arity()) {
            return proc.call(env, args);
        }
        throw new RuntimeError("Procedure '" + this.ident + "' expects " + proc.params.length + " arguments");
    }

    dump(prefix) {
        app.terminal.writeln(prefix + '\x1b[33;1mCallProcExprAST\x1b[0m: ' + this.ident);
        for (let arg of this.args) {
            arg.dump(prefix + '  ');
        }
        
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
                throw new RuntimeError('Type mismatch in unary expression');
        }
        else if (this.op == 'NOT') {
            if (typeof(value) == 'boolean')
                return !value;
            else
                throw new RuntimeError('Type mismatch in unary expression');
        }
        return null;
    }

    dump(prefix) {
        app.terminal.writeln(prefix + '\x1b[33;1mUnaryExprAST\x1b[0m: : ' + this.op);
        this.expr.dump(prefix + '  ');
        
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
            else {
                throw new RuntimeError('Type mismatch in binary expression');
            }
        }
        else if (this.op == 'AND' || this.op == 'OR') {
            if (typeof(lhs) == 'boolean' && typeof(rhs) == 'boolean') {
                if (this.op == 'AND')
                    return lhs && rhs;
                else if (this.op == 'OR')
                    return lhs || rhs;
            }
            else {
                throw new RuntimeError('Type mismatch in binary expression');
            }
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
            else {
                throw new RuntimeError('Type mismatch in binary expression');
            }
        }
        else if (this.op == '&') {
            if (typeof(lhs) == 'string' && typeof(rhs) == 'string') {
                return lhs + rhs;
            }
            else {
                throw new RuntimeError('Type mismatch in binary expression');
            }
        }
        throw new RuntimeError('Unknown binary operator');
    }

    dump(prefix) {
        app.terminal.writeln(prefix + '\x1b[33;1mBinaryExprAST\x1b[0m: : ' + this.op);
        this.lhs.dump(prefix + '  ');
        this.rhs.dump(prefix + '  ');
        
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
        
    }
}

class TimeExprAST {
    constructor() {
    }

    evaluate(env) {
        return new Date().getTime();
    }

    dump(prefix) {
        app.terminal.writeln(prefix + 'TimeExprAST');
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
        app.terminal.writeln(prefix + '\x1b[33;1mNumberAST\x1b[0m: ' + this.value.toString());
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
        app.terminal.writeln(prefix + '\x1b[33;1mStringAST\x1b[0m: : ' + this.value);
        
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
        app.terminal.writeln(prefix + '\x1b[33;1mBoolAST\x1b[0m: ' + this.value);
        
    }
}

class OutputAST {
    constructor(exprs) {
        this.exprs = exprs;
    }

    evaluate(env) {
        for (let expr of this.exprs) {
            let value = expr.evaluate(env);
            if (value == null)
                return null;
            app.terminal.writeln(value.toString());
            // for debug
            // console.log(value.toString());
        }
    }

    dump(prefix) {
        app.terminal.writeln(prefix + '\x1b[31;1mOutputAST\x1b[0m');
        for (let expr of this.exprs) {
            expr.dump(prefix + '  ');
        }
    }
}

class InputAST {
    // Not usable yet
    constructor(ident) {
        this.ident = ident;
    }

    evaluate(env) {
        let value = prompt('Input value for ' + this.ident);
        if (value)
            env.set_variable(this.ident, value);
        throw new RuntimeError('Cannot input a empty value');
    }
    
    dump(prefix) {
        app.terminal.writeln(prefix + 'InputAST: ' + this.ident);
    }
}

export {
    ProgramAST,
    FuncDefAST,
    ProcDefAST,
    ReturnAST,
    VarDeclAST,
    ArrDeclAST,
    TypeDefAST,
    TypeVarDeclAST,
    TypeArrDeclAST,
    VarAssignAST,
    ArrAssignAST,
    TypeVarAssignAST,
    TypeArrAssignAST,
    IfAST,
    WhileAST,
    ForAST,
    VarExprAST,
    ArrExprAST,
    TypeVarExprAST,
    TypeArrExprAST,
    CallFuncExprAST,
    CallProcExprAST,
    UnaryExprAST,
    BinaryExprAST,
    RndExprAST,
    TimeExprAST,
    NumberAST,
    StringAST,
    BoolAST,
    OutputAST,
    InputAST
}
