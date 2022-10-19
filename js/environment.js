import { Variable, TypeVar } from './variable.js';
import { Array } from './array.js';
import { Type } from './type.js';
import { Function } from './function.js';
import { Procedure } from './procedure.js';
import { Error } from './error.js';


class Environment {
    constructor(enclosing = null) {
        this.enclosing = enclosing;
        // store in different dicts
        this.variables = {};
        this.types = {}
        this.typevars = {}
        this.arrays = {};
        this.functions = {};
        this.procedures = {};
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

    define_type(name, body) {
        if (name in this.types) {
            throw new Error('Type already declared: ' + name);
        }
        this.types[name] = new Type(name, body);
    }

    declare_typevar(name, type) {
        if (name in this.typevars) {
            throw new Error('Type variable already declared: ' + name);
        }
        if (type in this.types) {
            this.typevars[name] = new TypeVar(name, this.types[type]);
        }
    }

    // define function
    define_function(name, params, type, body) {
        if (name in this.functions) {
            throw new Error('Function already declared: ' + name);
        }
        this.functions[name] = new Function(name, params, type, body);
    }

    define_procedure(name, params, body) {
        if (name in this.procedures) {
            throw new Error('Procedure already declared: ' + name);
        }
        this.procedures[name] = new Procedure(name, params, body);
    }

    set_variable(name, value) {
        if (name in this.variables) {
            this.variables[name].assign(value);
        }
        else if (this.enclosing != null) {
            this.enclosing.set_variable(name, value);
        }
        else {
            throw new Error("Use of undeclared Variable '" + name + "'");
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
            throw new Error("Use of undeclared Array '" + name + "'");
        }
    }

    set_typevar(name, var_name, value) {
        if (name in this.typevars) {
            this.typevars[name].env.set_variable(var_name, value);
        }
        else if (this.enclosing != null) {
            this.enclosing.set_typevar(name, var_name, value);
        }
        else {
            throw new Error("Use of undeclared Type Variable '" + name + "'");
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
            throw new Error("Use of undeclared Variable '" + name + "'");
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
            throw new Error("Use of undeclared Array '" + name + "'");
        }
    }

    get_typevar(name, var_name) {
        if (name in this.typevars) {
            return this.typevars[name].env.get_variable(var_name);
        }
        else if (this.enclosing != null) {
            return this.enclosing.get_typevar(name, var_name);
        }
        else {
            throw new Error("Use of undeclared Type Variable '" + name + "'");
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
            throw new Error("Use of undefined Function '" + name + "'");
        }
    }

    get_procedure(name) {
        if (name in this.procedures) {
            return this.procedures[name];
        }
        else if (this.enclosing != null) {
            return this.enclosing.get_procedure(name);
        }
        else {
            throw new Error("Use of undefined Procedure '" + name + "'");
        }
    }
}

export {
    Environment
}
