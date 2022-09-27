class Environment {
    constructor(enclosing = null) {
        this.enclosing = enclosing;
        this.variables = {};
        this.arrays = {};
        this.functions = {};
    }
}

export {
    Environment
}
