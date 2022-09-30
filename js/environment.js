import { Variable } from './variable.js';
import { Array } from './array.js';
import { Error } from './error.js';


class Environment {
    constructor(enclosing = null) {
        this.enclosing = enclosing;
        // store in different dicts
        this.variables = {};
        this.arrays = {};
        this.functions = {};
    }

    declare_variable(name, type) {
        if (name in this.variables) {
            throw new Error('Variable already declared: ' + name);
        }
        this.variables[name] = new Variable(name, type);
    }

    declare_array(name, type, lower, upper) {
        if (name in this.arrays) {
            throw new Error('Array already declared: ' + name);
        }
        this.arrays[name] = new Array(name, type, lower, upper);
    }

    // define function
    define(name, value) {
        this.functions[name] = value;
    }

    set_variable(name, value) {
        if (name in this.variables) {
            this.variables[name].assign(value);
        }
        else if (this.enclosing != null) {
            this.enclosing.set_variable(name, value);
        }
        else {
            throw new Error('Variable ' + name + ' not found');
        }
    }

    set_array(name, index, value) {
        if (name in this.arrays) {
            this.arrays[name].assign(index, value);
        }
        else if (this.enclosing != null) {
            this.enclosing.set_array(name, index, value);
        }
        else {
            throw new Error('Array ' + name + ' not found');
        }
    }

    get_variable(name) {
        if (name in this.variables) {
            return this.variables[name].get();
        }
        else if (this.enclosing != null) {
            return this.enclosing.get_variable(name);
        }
        else {
            throw new Error('Variable ' + name + ' not found');
        }
    }

    get_array(name, index) {
        if (name in this.arrays) {
            return this.arrays[name].get(index);
        }
        else if (this.enclosing != null) {
            return this.enclosing.get_array(name);
        }
        else {
            throw new Error('Array ' + name + ' not found');
        }
    }

    get_function(name) {
        if (name in this.functions) {
            return this.functions[name];
        }
        else if (this.enclosing != null) {
            return this.enclosing.get_function(name);
        }
        else {
            throw new Error('Function ' + name + ' not found');
        }
    }
}

export {
    Environment
}
