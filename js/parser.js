import { 
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
    CallExprAST,
    UnaryExprAST,
    BinaryExprAST,
    NumberAST,
    StringAST,
    BoolAST,
    OutputAST
} from "./ast.js";

import { Error } from "./error.js";

class Parser {
    constructor(tokens) {
        this.tokens = tokens;

        // the current token
        this.current = 0;
    }

    report_error(msg) {
        let line = this.tokens[this.current]['line'];
        let column = this.tokens[this.current]['column'];
        let value = this.tokens[this.current]['value'];
        throw new Error(msg + ' (line: ' + line + ', column: ' + column + ', value: ' + value + ')');
    }

    expect_type(type, throw_error = true) {
        if (this.current < this.tokens.length) {
            let current_type = this.tokens[this.current]['type'];
            let current_value = this.tokens[this.current]['value'];

            if (current_type == type) {  
                this.current++;
                return current_value;
            }
            if (throw_error)
                this.report_error("Expected token with type: '" + type + "', Got token" + '(type: ' + current_type + ', value:' + current_value + ')');
            return null;
        }
        if (throw_error)
            this.report_error("Expected token with type: '" + type + "', Got end of line");
        return null;
    }

    expect_value(value, throw_error = true) {
        if (this.current < this.tokens.length) {
            let current_type = this.tokens[this.current]['type'];
            let current_value = this.tokens[this.current]['value'];

            if (current_value == value) {
                this.current++;
                return current_value;
            }
            if (throw_error)
                this.report_error("Expected token with value: '" + value + "', Got token" + '(type: ' + current_type + ', value:' + current_value + ')');
            return null;
        }
        if (throw_error)
            this.report_error("Expected token with value: '" + value + "', Got end of line");
        return null;
    }

    peek_type() {
        return this.tokens[this.current]['type'];
    }
    
    parse() {
        let ast = new ProgramAST();
        while(this.current < this.tokens.length) {
            let node = this.parse_stmt();

            // if the node is not a new line node, add it to the ast body
            if (node) {
                ast.body.push(node);
            }
        }
        return ast;
    }

    parse_stmt() {
        let next_type = this.peek_type();
    
        if (next_type == 'declare') {
            return this.decl();
        }
        else if (next_type == 'identifier') {
            return this.assign();
        }        
        else if (next_type == 'if') {
            return this.if_statement();
        }
        else if (next_type == 'while') {
            return this.while_statement();
        }
        else if (next_type == 'for') {
            return this.for_statement();
        }
        else if (next_type == 'output') {
            return this.output();
        }
        else if (this.expect_type('newline', false)) {
            this.current_line++;
            return null;
        }
        this.report_error("Unexpected token: '" + next_type + "'");
    }

    parse_expr() {
        /*
        expr -> equality
        equality -> compar ( ( '=' | '<>' ) compar )*
        relation -> term ( ( '<' | '>' | '<=' | '>=' ) term )*
        term -> factor ( ( '+' | '-' ) factor )*
        factor -> unary ( ( '*' | '/' ) unary )*
        unary -> ( not | '+' | '-' ) unary | primary
        primary -> number | string | identifier | '(' expr ')'
        */
        return this.parse_equality();
    }

    parse_equality() {
        let expr = this.parse_compar();
        
        while (true) {
            let ex_op = this.expect_value('=', false) || this.expect_value('<>', false) || this.expect_value('OR', false);
            if (ex_op) {
                let rhs = this.parse_compar();
                expr = new BinaryExprAST(ex_op, expr, rhs);
            }
            else {
                return expr;
            }
        } 
    }

    parse_compar() {
        let expr = this.parse_term();

        while (true) {
            let ex_op = this.expect_value('<', false) || this.expect_value('>', false) || this.expect_value('<=', false) || this.expect_value('>=', false) || this.expect_value('AND', false);
            if (ex_op) {
                let rhs = this.parse_term();
                expr = new BinaryExprAST(ex_op, expr, rhs);
            }
            else {
                return expr;
            }
        }
    }

    parse_term() {  
        let expr = this.parse_factor();

        while (true) {
            let ex_op = this.expect_value('+', false) || this.expect_value('-', false);
            if (ex_op) {
                let rhs = this.parse_factor();
                expr = new BinaryExprAST(ex_op, expr, rhs);
            }
            else {
                return expr;
            }
        }
    }

    parse_factor() {
        let expr = this.parse_unary();

        while (true) {
            let ex_op = this.expect_value('*', false) || this.expect_value('/', false);
            if (ex_op) {
                let rhs = this.parse_unary();
                expr = new BinaryExprAST(ex_op, expr, rhs);
            }
            else {
                return expr;
            }
        }
    }

    parse_unary() {
        let ex_op = this.expect_value('NOT', false) || this.expect_value('+', false) || this.expect_value('-', false);
        if (ex_op) {
            let rhs = this.parse_unary();
            return new UnaryExprAST(ex_op, rhs);
        }
        return this.parse_primary();
    }

    parse_primary() {
        // preform this.current++ in the if statements for correct error msg
        let current_type = this.tokens[this.current]['type'];
        let current_value = this.tokens[this.current]['value'];
        if (this.expect_type('boolean', false)) {
            return new BoolAST(current_value);
        }
        else if (this.expect_type('number', false)) {
            return new NumberAST(current_value);
        }
        else if (this.expect_type('string', false)) {
            return new StringAST(current_value);
        }
        else if (this.expect_type('identifier', false)) {
            let ex_lpar = this.expect_value('[', false);
            if (ex_lpar) {
                let index = this.parse_expr();
                this.expect_value(']');
                return new ArrExprAST(current_value, index);
            }
            return new VarExprAST(current_value);
        }
        else if (this.expect_type('call', false)) {
            let ex_ident = this.expect_type('identifier');
            let ex_lpar = this.expect_value('(');
            let args = [];
            while (this.tokens[this.current]['value'] != ')') {
                let arg = this.parse_expr();
                args.push(arg);
                let ex_comma = this.expect_value(',', false);
                if (!ex_comma)
                    break;
            }
            let ex_rpar = this.expect_value(')');
            if (ex_ident && ex_lpar && ex_rpar)
                return new CallExprAST(current_value, params);
        }
        else if (this.expect_value('(', false)) {
            let expr = this.parse_expr();
            // use expect_value to give an error if not found
            let ex_lpar = this.expect_value(')');
            if (expr && ex_lpar)
                return expr;
        }
        this.report_error("Unexpected token: '" + current_type + "'");
    }
        

    // *****built in functions*****
    output() {
        let ex_output = this.expect_type('output');
        let ex_expr = this.parse_expr();
        if (ex_output && ex_expr)
            return new OutputAST(ex_expr);
        return null;
    }

    decl() {
        /*
        decl -> declare identifier ':' type | decl -> declare identifier ':' array '[' ']' OF type
        */
        let ex_declare = this.expect_type('declare');
        let ex_ident = this.expect_type('identifier');
        let ex_op = this.expect_value(':');
        let ex_type = this.expect_type('type', false);
        if (ex_declare && ex_ident && ex_op && ex_type)
            return new VarDeclAST(ex_ident, ex_type);
        let ex_arr = this.expect_type('array');
        let ex_lpar = this.expect_value('[');
        let ex_lower = this.expect_type('number');
        let ex_op2 = this.expect_value(':');
        let ex_upper = this.expect_type('number');
        let ex_rpar = this.expect_value(']');
        let ex_of = this.expect_type('of');
        ex_type = this.expect_type('type');
        if (ex_declare && ex_ident && ex_op && ex_arr && ex_lpar && ex_lower && ex_op2 && ex_upper && ex_rpar && ex_of && ex_type)
            return new ArrDeclAST(ex_ident, ex_type, ex_lower, ex_upper);
        this.report_error("Unexpected token: '" + this.tokens[this.current]['type'] + "'");
    }

    var_decl() {
        /*
        var_decl -> declare identifier ':' type
        */
    }

    assign() {
        /*
        assign -> identifier '<-' expr | identifier '[' expr ']' '<-' expr
        */
        let ex_ident = this.expect_type('identifier');
        let ex_lpar = this.expect_value('[', false);
        if (ex_lpar) {
            let ex_index = this.parse_expr();
            let ex_rpar = this.expect_value(']');
            let ex_op = this.expect_value('<-');
            let ex_expr = this.parse_expr();
            if (ex_ident && ex_lpar && ex_index && ex_rpar && ex_op && ex_expr)
                return new ArrAssignAST(ex_ident, ex_index, ex_expr);
            this.report_error("Unexpected token: '" + this.tokens[this.current]['type'] + "'");
        }
        let ex_op = this.expect_value('<-');
        let ex_expr = this.parse_expr();
        if (ex_ident && ex_op && ex_expr)
            return new VarAssignAST(ex_ident, ex_expr);
        this.report_error("Unexpected token: '" + this.tokens[this.current]['type'] + "'");
    }

    variable_assignment() {
        /*
        var_assign -> identifier '<-' expr
        */
    }

    if_statement() {
        /*
        if_statement -> if expr then statement_list (else statement_list)? endif
        */
        let ex_if = this.expect_type('if');
        let ex_cond = this.parse_expr();
        let ex_then = this.expect_type('then');
        let ex_body = [];
        let ex_else = this.expect_type('else', false);
        let ex_endif = this.expect_type('endif', false);
        while(ex_else == null && ex_endif == null) {
            let node = this.parse_stmt();

            if (node == null)
                return null;

            ex_body.push(node);
            ex_else = this.expect_type('else', false);
            ex_endif = this.expect_type('endif', false);
        }
        if (ex_if && ex_cond && ex_then && ex_endif)
            return new IfAST(ex_expr, ex_body);

        let ex_else_body = [];
        while(ex_endif == null) {
            let node = this.parse_stmt();

            if (node == null)
                return null;

            ex_else_body.push(node);
            ex_endif = this.expect_type('endif', false);
        }
        if (ex_if && ex_cond && ex_then && ex_body && ex_else && ex_else_body && ex_endif)
            return new IfAST(ex_cond, ex_body, ex_else_body);
        this.report_error("Unexpected token: '" + this.tokens[this.current]['type'] + "'");
    }

    while_statement() {
        let ex_while = this.expect_type('while', false);
        let ex_expr = this.parse_expr();
        let ex_body = [];
        let ex_endwhile = this.expect_type('endwhile', false);
        while(ex_endwhile == null) {
            let node = this.parse_stmt();

            if (node == null)
                return null

            ex_body.push(node);
            ex_endwhile = this.expect_type('endwhile', false);
        }
        if (ex_while && ex_expr && ex_body && ex_endwhile)
            return new WhileAST(ex_expr, ex_body);
        this.report_error("Unexpected token: '" + this.tokens[this.current]['type'] + "'");
    }

    for_statement() {
        let ex_for = this.expect_type('for');
        let ex_ident = this.expect_type('identifier');
        let ex_op = this.expect_value('<-');
        let ex_start = this.parse_expr();
        let ex_to = this.expect_type('to');
        let ex_end = this.parse_expr();
        let ex_step = this.expect_type('step', false);
        let ex_step_val = null;
        if (ex_step)
            ex_step_val = this.parse_expr();
        let ex_body = [];
        let ex_next = this.expect_type('next', false);
        while(ex_next == null) {
            let node = this.parse_stmt();

            if (node == null)
                return null

            ex_body.push(node);
            ex_next = this.expect_type('next', false);
        }
        let ex_ident2 = this.expect_type('identifier');
        if (ex_for && ex_ident && ex_op && ex_start && ex_to && ex_end && ex_step_val && ex_body && ex_next && ex_ident2 == ex_ident)
            return new ForAST(ex_ident, ex_start, ex_end, ex_body, ex_step_val);
        if (ex_for && ex_ident && ex_op && ex_start && ex_to && ex_end && ex_body && ex_next && ex_ident2 == ex_ident)
            return new ForAST(ex_ident, ex_start, ex_end, ex_body);
        this.report_error("Unexpected token: '" + this.tokens[this.current]['type'] + "'");
    }
}

export {
    Parser
}
