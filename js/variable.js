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
}

export {
    Variable,
    TypeVar
}
