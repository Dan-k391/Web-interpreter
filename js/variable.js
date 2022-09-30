import { Error } from './error.js';


function type_of(value) {
    if (typeof(value) == 'number') {
        if (String(num).indexOf('.') > -1)
            return 'integer';
        else
            return 'real';
    }
    else if (typeof(value) == 'string') {
        return 'string';
    }
    else if (typeof(value) == 'boolean') {
        return 'boolean';
    }
}

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
            throw new Error('Type mismatch for variable: ' + this.ident);
        }
    }

    get() {
        return this.value;
    }
}

export {
    Variable
}
