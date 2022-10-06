import { Error } from './error.js';

class Variable {
    constructor(ident, type, value = null) {
        this.ident = ident;
        this.type = type;
        this.value = value;
    }

    assign(value) {
        if (typeof(value) == this.type) {
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

export {
    Variable
}
