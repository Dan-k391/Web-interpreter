import { Environment } from './environment.js';
import { Variable } from './variable.js';
import { RuntimeError } from './error.js';
import { Return } from './function.js';
import { type_of } from './type.js';


class Procedure {
    /**
     * 
     * @param {string} ident 
     * @param {array(param)} params 
     * param {id: id, type: type}
     * @param {string} type
     * @param {array(stmt)} body 
     */
     constructor(ident, params, body) {
        this.ident = ident;
        this.params = params;
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
            let param_type = param.type.toLowerCase();

            if (type_of(arg) == param_type) {
                // declare then set...
                env.declare_variable(param['id'], param_type);
                env.set_variable(param['id'], arg);
            }
            else
                throw new RuntimeError("Type mismatch in argument '" + param['id'] + "' of procedure '" + this.ident + "'");
        }
        for (let node of this.body) {
            try {
                // The object env is passed by reference
                node.evaluate(env);
            }
            catch (e) {
                if (e instanceof Return) {
                    throw new RuntimeError("Procedure cannot contain return statement: '" + this.ident + "'");
                }
                else {
                    throw e;
                }
            }
        }
    }
}

export {
    Procedure
}
