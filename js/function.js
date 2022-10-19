import { Environment } from './environment.js';
import { Variable } from './variable.js';
import { Error } from './error.js';
import { type_of } from './type.js';


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

    /**
     * 
     * @param {Environment} g_env global environment
     * @param {} args 
     * @returns 
     */
    call(g_env, args) {
        let env = new Environment(g_env);
        for (let i = 0; i < this.params.length; i++) {
            let param = this.params[i];
            let arg = args[i];
            let param_type = param.type.toLowerCase();

            if (type_of(arg) == param_type) {
                // declare then set...
                env.declare_variable(param['id'], param_type);
                env.set_variable(param['id'], arg);
            }
            else {
                throw new Error("Type mismatch in argument '" + param['id'] + "' of function '" + this.ident + "'");
            }
        }
        for (let node of this.body) {
            try {
                // The object env is passed by reference
                node.evaluate(env);
            }
            catch (e) {
                if (e instanceof Return) {
                    if (type_of(e.value) == this.type) {
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
