import { Environment } from './environment.js';

class Function {
    /**
     * 
     * @param {string} ident 
     * @param {Variable} params 
     * @param {array(stmt)} body 
     */
    constructor(ident, params, body) {
        this.ident = ident;
        this.params = params;
        this.body = body;
    }

    call(args) {
        let env = new Environment();
        for (let i = 0; i < this.params.length; i++) {
            env.variables[this.params[i].ident] = args[i];
        }
        for (let node of this.body) {
            // The object env is passed by reference
            node.evaluate(env);
        }
    }
}

export {
    Function
}
