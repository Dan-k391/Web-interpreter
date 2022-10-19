import { Error } from './error.js';
import { type_of } from './type.js';


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
            throw new Error("Index '" + index + "' out of bounds for array '" + this.ident + "'");
        }
        if (type_of(value) == this.type) {
            this.values[index] = value;
        }
        else {
            throw new Error("Type mismatch for array '" + this.ident + "'");
        }
    }

    get(index) {
        if (index < this.lower || index > this.upper) {
            throw new Error("Index '" + index + "' out of bounds for array '" + this.ident + "'");
        }
        if (this.values[index] == null) {
            throw new Error("Array '" + this.ident + "' is not initialized");
        }
        return this.values[index];
    }
}

export {
    Array
}
