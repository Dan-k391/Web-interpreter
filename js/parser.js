// TODO: unify variable names

import { 
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
} from './ast.js';
import { Error } from './error.js';


class Parser {
    constructor(tokens) {
        this.tokens = tokens;

        // the current token
        this.current = 0;
    }

    report_error(msg) {
        let line = this.tokens[this.current]['line'];
        let start_column = this.tokens[this.current]['start_column'];
        let end_column = this.tokens[this.current]['end_column'];
        let value = this.tokens[this.current]['value'];
        let type = this.tokens[this.current]['type'];
        throw new Error(msg + " (type '" + type + "', value: '" + value + "')", line, start_column, end_column);
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

    expect_type(type, throw_error = true) {
        if (this.current < this.tokens.length) {
            let current_type = this.tokens[this.current]['type'];
            let current_value = this.tokens[this.current]['value'];

            if (current_type == type) {  
                this.current++;
                return current_value;
            }
            if (throw_error)
                this.report_error("Expected token with type: '" + type + "', Got token");
            return null;
        }
        if (throw_error) {
            // report the last token as error, otherwise the program will read undefined
            this.current--;
            this.report_error("Expected token with type: '" + type + "', Got EOF");
        }
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
                this.report_error("Expected token with value: '" + value + "', Got token");
            return null;
        }
        if (throw_error) {
            // report the last token as error, otherwise the program will read undefined
            this.current--;
            this.report_error("Expected token with value: '" + value + "', Got end of file");
        }
        return null;
    }

    peek_type() {
        if (this.current < this.tokens.length) {
            return this.tokens[this.current]['type'];
        }
        this.current--;
        this.report_error('Unexpected end of file');
    }

    peek_value() {
        if (this.current < this.tokens.length) {
            return this.tokens[this.current]['value'];
        }
        this.current--;
        this.report_error('Unexpected end of file');
    }

    parse_stmt() {
        let next_type = this.peek_type();
        
        if (next_type == 'function') {
            return this.func_def();
        }
        else if (next_type == 'declare')
            // variable and array declaration
            return this.decl();
        else if (next_type == 'identifier')
            // variable and array assignment
            return this.assign();
        else if (next_type == 'if')
            return this.if_statement();
        else if (next_type == 'while')
            return this.while_statement();
        else if (next_type == 'for')
            return this.for_statement();
        else if (next_type == 'return')
            return this.return_statement();
        else if (next_type == 'call')
            // call expr will be handled uniquely
            return this.parse_expr();
        else if (next_type == 'output')
            return this.output();    
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
            // put & here because it is a add operator
            let ex_op = this.expect_value('+', false) || this.expect_value('-', false) || this.expect_value('&', false);
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
        let current_type = this.peek_type();
        let current_value = this.peek_value();
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
            /*
            call_expr -> call ident '(' params ')'
            */
            let ex_ident = this.expect_type('identifier');
            let ex_lpar = this.expect_value('(');
            let args = [];
            let ex_rpar = this.expect_value(')', false);
            while (!ex_rpar) {
                let arg = this.parse_expr();
                args.push(arg);
                let ex_comma = this.expect_value(',', false);

                ex_rpar = this.expect_value(')', false);

                if (!ex_comma)
                    break;
            }
            if (ex_ident && ex_lpar && ex_rpar)
                return new CallExprAST(ex_ident, args);
        }
        // parse rnd into an expr ast
        else if (this.expect_type('rnd', false)) {
            let ex_lpar = this.expect_value('(');
            let ex_rpar = this.expect_value(')');
            if (ex_lpar && ex_rpar)
                return new RndExprAST();
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
        

    // *****built in methods*****
    output() {
        let ex_output = this.expect_type('output');
        let ex_exprs = [];
        let ex_expr = this.parse_expr();
        while (ex_expr) {
            ex_exprs.push(ex_expr);
            let ex_comma = this.expect_value(',', false);
            if (!ex_comma)
                break;
            ex_expr = this.parse_expr();
        }
        if (ex_output && ex_exprs)
            return new OutputAST(ex_exprs);
        return null;
    }

    func_def() {
        /**
         * func_def -> function identifier returns type body endfunction
         */
        let ex_func = this.expect_type('function');
        let ex_ident = this.expect_type('identifier');
        let ex_lpar = this.expect_value('(');
        let ex_params = [];
        let ex_rpar = this.expect_value(')', false);
        while (!ex_rpar) {
            let ex_ident = this.expect_type('identifier');
            let ex_colon = this.expect_value(':');
            let ex_type = this.expect_type('type');
            // param : { id: id, type: type }
            if (ex_ident && ex_colon && ex_type)
                ex_params.push({ id: ex_ident, type: ex_type });
            let ex_comma = this.expect_value(',', false);
            ex_rpar = this.expect_value(')', false);

            if (!ex_comma)
                break;
        }
        let ex_returns = this.expect_type('returns');
        let ex_type = this.expect_type('type');
        let ex_body = [];
        let ex_endfunc = this.expect_type('endfunction', false);
        while (!ex_endfunc) {
            let node = this.parse_stmt();

            if (node == null)
                return null;

            ex_body.push(node);
            ex_endfunc = this.expect_type('endfunction', false);
        }
        if (ex_func && ex_ident && ex_lpar && ex_rpar && ex_returns && ex_type && ex_endfunc)
            return new FuncDefAST(ex_ident, ex_params, ex_type, ex_body)
        this.report_error("Unexpected token: '" + this.tokens[this.current]['type'] + "'");
    }

    return_statement() {
        let ex_return = this.expect_type('return');
        let ex_expr = this.parse_expr();
        if (ex_return && ex_expr)
            return new ReturnAST(ex_expr);
        this.report_error("Unexpected token: '" + this.tokens[this.current]['type'] + "'");
    }

    decl() {
        /**
         * decl -> declare identifier ':' type | decl -> declare identifier ':' array '[' ']' OF type
         */
        let ex_decl = this.expect_type('declare');
        let ex_ident = this.expect_type('identifier');
        let ex_colon = this.expect_value(':');
        let ex_type = this.expect_type('type', false);
        if (ex_decl && ex_ident && ex_colon && ex_type)
            return new VarDeclAST(ex_ident, ex_type);
        let ex_arr = this.expect_type('array');
        let ex_lpar = this.expect_value('[');
        // array bug, brugh
        let ex_lower = this.parse_expr();
        let ex_colon2 = this.expect_value(':');
        let ex_upper = this.parse_expr();
        let ex_rpar = this.expect_value(']');
        let ex_of = this.expect_type('of');
        ex_type = this.expect_type('type');
        if (ex_decl && ex_ident && ex_colon && ex_arr && ex_lpar && ex_lower && ex_colon2 && ex_upper && ex_rpar && ex_of && ex_type)
            return new ArrDeclAST(ex_ident, ex_type, ex_lower, ex_upper);
        this.report_error("Unexpected token: '" + this.tokens[this.current]['type'] + "'");
    }

    assign() {
        /**
         * assign -> identifier '<-' expr | identifier '[' expr ']' '<-' expr
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

    if_statement() {
        /**
         * if_statement -> if expr then statement_list (else statement_list)? endif
         */
        let ex_if = this.expect_type('if');
        let ex_cond = this.parse_expr();
        let ex_then = this.expect_type('then');
        let ex_body = [];
        let ex_else = this.expect_type('else', false);
        let ex_endif = this.expect_type('endif', false);
        while(!ex_else && !ex_endif) {
            let node = this.parse_stmt();

            if (node == null)
                return null;

            ex_body.push(node);
            ex_else = this.expect_type('else', false);
            ex_endif = this.expect_type('endif', false);
        }
        if (ex_if && ex_cond && ex_then && ex_endif)
            return new IfAST(ex_cond, ex_body);

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
        while(!ex_endwhile) {
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
        while(!ex_next) {
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
