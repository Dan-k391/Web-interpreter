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