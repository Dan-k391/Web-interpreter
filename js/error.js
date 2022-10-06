class Error {
    constructor(msg, line = null, start_column = null, end_column = null) {
        this.msg = msg;
        this.line = line;
        this.start_column = start_column;
        this.end_column = end_column;
    }

    toString() {
        if (this.line != null && this.start_column != null) {
            return this.msg + ' at line ' + this.line + ':' + this.start_column;
        }
        return this.msg;
    }
}

export {
    Error
}
