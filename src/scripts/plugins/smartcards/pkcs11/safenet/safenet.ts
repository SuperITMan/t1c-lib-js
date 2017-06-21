import { RestException } from "../../../../core/exceptions/CoreExceptions";
import { CertificatesResponse } from "../../../../core/service/CoreModel";
import { LocalConnection } from "../../../../core/client/Connection";
import * as _ from "lodash";
import { CertParser } from "../../../../util/CertParser";
import { ResponseHandler } from "../../../../util/ResponseHandler";
import { AbstractSafeNet, InfoResponse, Pin, SlotAndPin, SlotsResponse } from "./safenetModel";
import * as platform from "platform";


/**
 * @author Maarten Somers
 */


export { SafeNet };

class SafeNet implements AbstractSafeNet {
    static ALL_CERTIFICATES = "/certificates";
    static INFO = "/info";
    static SLOTS = "/slots";
    static DEFAULT_CONFIG = {
        linux: "/usr/local/lib/libeTPkcs11.so",
        mac: "/usr/local/lib/libeTPkcs11.dylib",
        win: "C:\\Windows\\System32\\eTPKCS11.dll"
    };

    private modulePath;
    private os;


    constructor(protected baseUrl: string,
                protected containerUrl: string,
                protected connection: LocalConnection,
                protected moduleConfig?: { linux: string, mac: string, win: string}) {
        // determine os
        if (platform.os.indexOf("Win") > -1) { this.os = "win"; }
        if (platform.os.indexOf("OS X") > -1) { this.os = "mac"; }
        // assume we are dealing with linux ==> will not always be correct!
        if (!this.os) { this.os = "linux"; }

        if (moduleConfig && moduleConfig[this.os]) { this.modulePath = moduleConfig[this.os]; }
        else { this.modulePath = SafeNet.DEFAULT_CONFIG[this.os]; }
    }

    public certificates(body: SlotAndPin,
                        callback?: (error: RestException, data: CertificatesResponse) => void): Promise<CertificatesResponse> {
        let req = _.extend(body, { module: this.modulePath });
        return this.connection.post(this.resolvedURI() + SafeNet.ALL_CERTIFICATES, req, undefined).then(data => {
            return CertParser.process(data, callback);
        }, err => {
            // if we encounter error try again with default (if possible)
            if (this.moduleConfig) {
                let defaultReq = _.extend(body, { module: SafeNet.DEFAULT_CONFIG[this.os] });
                return this.connection.post(this.resolvedURI() + SafeNet.ALL_CERTIFICATES, defaultReq, undefined).then(data => {
                    return CertParser.process(data, callback);
                }, defaultErr => {
                    return ResponseHandler.error(defaultErr, callback);
                });
            } else { return ResponseHandler.error(err, callback); }
        });
    }

    public info(body: Pin, callback: (error: RestException, data: InfoResponse) => void): Promise<InfoResponse> {
        let req = _.extend(body, { module: this.modulePath });
        return this.connection.post(this.resolvedURI() + SafeNet.INFO, req, undefined).then(data => {
            return ResponseHandler.response(data, callback);
        }, err => {
            if (this.moduleConfig) {
                let defaultReq = _.extend(body, { module: SafeNet.DEFAULT_CONFIG[this.os] });
                return this.connection.post(this.resolvedURI() + SafeNet.INFO, defaultReq, undefined, callback);
            } else { return ResponseHandler.error(err, callback); }
        });
    }

    public slots(body: Pin, callback: (error: RestException, data: SlotsResponse) => void): Promise<SlotsResponse> {
        let req = _.extend(body, { module: this.modulePath });
        return this.connection.post(this.resolvedURI() + SafeNet.SLOTS, req, undefined).then(data => {
            return ResponseHandler.response(data, callback);
        }, err => {
            if (this.moduleConfig) {
                let defaultReq = _.extend(body, { module: SafeNet.DEFAULT_CONFIG[this.os] });
                return this.connection.post(this.resolvedURI() + SafeNet.SLOTS, defaultReq, undefined, callback);
            } else { return ResponseHandler.error(err, callback); }
        });
    }

    public slotsWithTokenPresent(body: Pin, callback: (error: RestException, data: SlotsResponse) => void): Promise<SlotsResponse> {
        let req = _.extend(body, { module: this.modulePath });
        return this.connection.post(this.resolvedURI() + SafeNet.SLOTS, req, { "token-present": "true" }).then(data => {
            return ResponseHandler.response(data, callback);
        }, err => {
            if (this.moduleConfig) {
                let defaultReq = _.extend(body, { module: SafeNet.DEFAULT_CONFIG[this.os] });
                return this.connection.post(this.resolvedURI() + SafeNet.SLOTS, defaultReq, { "token-present": "true" }, callback);
            } else { return ResponseHandler.error(err, callback); }
        });
    }


    // resolves the reader_id in the base URL
    protected resolvedURI(): string {
        return this.baseUrl + this.containerUrl;
    }
}

