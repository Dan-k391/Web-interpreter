import { Environment } from './environment.js';
import { Variable } from './variable.js';
import { Error } from './error.js';


class Function {
    /**
     * 
     * @param {string} ident 
     * @param {array(param)} params 
     * param {id: id, type: type}
     * @param {string} type
     * @param {array(stmt)} body 
     */
    constructor(ident, params, type, body) {
        this.ident = ident;
        this.params = params;
        this.type = type;
        this.body = body;
    }

    arity() {
        return this.params.length;
    }

    call(g_env, args) {
        let env = new Environment(g_env);
        for (let i = 0; i < this.params.length; i++) {
            let param = this.params[i];
            let arg = args[i];
            let param_type;
            if (param.type == 'INTEGER' || param.type == 'REAL') {
                param_type = 'number';
            }
            else if (param.type == 'STRING' || param.type == 'CHAR') {
                param_type = 'string';
            }
            else if (param.type == 'BOOLEAN') {
                param_type = 'boolean';
            }
            else if (param.type == 'ARRAY') {
                // stupid way
                if (Array.isArray(arg)) {
                    env.declare_array(param['id'], arg);
                    let index = 0;
                    for (let item of arg) {
                        env.declare_array(param['id'], typeof(item));
                    }
                }
            }

            if (typeof(arg) == param_type) {
                // declare then set...
                env.declare_variable(param['id'], param_type);
                env.set_variable(param['id'], arg);
            }
            else
                throw new Error("Type mismatch in argument '" + param['id'] + "' of function '" + this.ident + "'");
        }
        for (let node of this.body) {
            try {
                // The object env is passed by reference
                node.evaluate(env);
            }
            catch (e) {
                if (e instanceof Return) {
                    if (typeof(e.value) == this.type) {
                        return e.value;
                    }
                    throw new Error("Type mismatch in return value of function: '" + this.ident + "'");
                }
                else {
                    throw e;
                }
            }
        }
        throw new Error("Function '" + this.ident + "' does not return a value");
    }
}

class Return {
    constructor(value) {
        this.value = value;
    }
}

export {
    Function,
    Return
}
