import { Error } from './error.js';
import { type_of } from './type.js';
import { Environment } from './environment.js';


class Variable {
    constructor(ident, type, value = null) {
        this.ident = ident;
        this.type = type;
        this.value = value;
    }

    assign(value) {
        if (type_of(value) == this.type) {
            this.value = value;
        }
        else {
            // do not f**king delete this else, shit!!!
            throw new Error("Type mismatch for variable '" + this.ident + "'");
        }
    }

    get() {
        if (this.value == null) {
            throw new Error("Variable '" + this.ident + "' is not initialized");
        }
        return this.value;
    }
}

class TypeVar {
    constructor(ident, type) {
        this.ident = ident;
        this.type = type;

        // the core is this environment
        this.env = new Environment();
        this.type.create(this.env);
    }

    assign(var_name, value) {
        console.log(this.env);
        this.env.set_variable(var_name, value);
    }

    get(var_name) {
        return this.env.get_variable(var_name);
    }
}

export {
    Variable,
    TypeVar
}
