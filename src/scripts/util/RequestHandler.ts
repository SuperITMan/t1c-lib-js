/**
 * @author Maarten Somers
 */
import * as _ from 'lodash';

export { RequestHandler, Options, RequestOptions };

class Options {
    constructor(public parseCerts: boolean, public filters?: string[]) {}
}

class RequestOptions {
    constructor(public parseCerts: boolean, public params?: { [key: string]: string}, public callback?: () => void) {}
}

class RequestHandler {
    // TODO deprecate for v3
    // maintains backward compatibility with the old request style
    public static determineOptions(firstParam: any, secondParam: any): RequestOptions {
        let result = new RequestOptions(false);
        if (firstParam) {
            if (typeof firstParam === 'function') { result.callback = firstParam; }
            else {
                result.callback = secondParam;
                if (_.has(firstParam, 'parseCerts')) { result.parseCerts = firstParam.parseCerts; }
            }
        } else {
            // no first param, check second
            if (typeof secondParam === 'function') { result.callback = secondParam; }
        }
        return result;
    }

    public static determineOptionsWithFilter(firstParam: string[] | Options): RequestOptions {
        let result = new RequestOptions(false, {});
        if (_.isArray(firstParam)) {
            // array of strings; assume parse boolean is false
            if (firstParam.length) { result.params.filter = firstParam.join(','); }
        } else if (_.isObject(firstParam)) {
            // not an array, but object
            if (_.has(firstParam, 'filters') && _.isArray(firstParam.filters)) {
                if (firstParam.filters.length) { result.params.filter = firstParam.filters.join(','); }
            }
            if (_.has(firstParam, 'parseCerts')) { result.parseCerts = firstParam.parseCerts; }
        }
        return result;
    }
}
