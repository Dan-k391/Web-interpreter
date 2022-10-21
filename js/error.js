class SyntaxError {
    constructor(msg, line = null, start_column = null, end_column = null) {
        this.msg = msg;
        this.line = line;
        this.start_column = start_column;
        this.end_column = end_column;
    }

    toString() {
        if (this.line != null && this.start_column != null) {
            return '\x1b[31;1mSyntaxError: \x1B[0m' + this.msg + ' at line ' + this.line + ':' + this.start_column;
        }
        return this.msg;
    }
}

class RuntimeError {
    constructor(msg) {
        this.msg = msg;
    }

    toString() {
        return '\x1b[31;1mRuntimeError: \x1B[0m' + this.msg;
    }
}

export {
    SyntaxError,
    RuntimeError
}
