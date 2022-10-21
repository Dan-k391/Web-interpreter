// TODO: Maybe support arrays in the future
// TODO: this should definitely by optimised

class Type {
    constructor(ident, body) {
        this.ident = ident;
        this.body = body;
    }

    create(env) {
        for (let node of this.body) {
            node.evaluate(env);
        }
    }
}

function type_of(value) {
    if (typeof(value) == 'number') {
        if (String(value).indexOf('.') > -1)
            return 'real';
        else
            return 'integer';
    }
    else if (typeof(value) == 'string') {
        return 'string';
    }
    else if (typeof(value) == 'boolean') {
        return 'boolean';
    }
}

export {
    Type,
    type_of
}
