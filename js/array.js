import { Error } from './error.js';


class Array {
    constructor(ident, type, lower, upper) {
        this.ident = ident;
        this.values = [];
        this.type = type;
        this.lower = lower;
        this.upper = upper;
    }

    assign(index, value) {
        if (index < this.lower || index > this.upper) {
            throw new Error('Index out of bounds');
        }
        if (typeof(value) == this.type) {
            this.values[index] = value;
        }
        else {
            throw new Error('Type mismatch for array: ' + this.ident);
        }
    }

    get(index) {
        if (index < this.lower || index > this.upper) {
            throw new Error('Index out of bounds');
        }
        return this.values[index];
    }
}

export {
    Array
}
