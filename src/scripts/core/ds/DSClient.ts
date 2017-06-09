/**
 * @author Michallis Pashidis
 * @author Maarten Somers
 */
import { Connection } from "../client/Connection";
import { GCLConfig } from "../GCLConfig";
import * as CoreExceptions from "../exceptions/CoreExceptions";
import * as _ from "lodash";
import { BrowserInfoResponse } from "../service/CoreModel";
import { AbstractDSClient, DeviceResponse, DownloadLinkResponse,
    DSInfoResponse, DSPlatformInfo, DSPubKeyResponse, JWTResponse } from "./DSClientModel";
import { Promise } from "es6-promise";

export { DSClient };


const SEPARATOR = "/";
const QP_APIKEY = "?apikey=";
const SECURITY = "/security";
const SYS_INFO = "/system/status";
const SECURITY_JWT_ISSUE = SECURITY + "/jwt/issue";
const SECURITY_JWT_REFRESH = SECURITY + "/jwt/refresh";
const DOWNLOAD = "/download/gcl";
const PUB_KEY = SECURITY + "/keys/public";
const DEVICE = "/devices";


class DSClient implements AbstractDSClient {
    constructor(private url: string, private connection: Connection, private cfg: GCLConfig) {}

    public getUrl() { return this.url; }

    public getInfo(): Promise<DSInfoResponse>;
    public getInfo(callback: (error: CoreExceptions.RestException, data: DSInfoResponse) => void): void;
    public getInfo(callback?: (error: CoreExceptions.RestException, data: DSInfoResponse) => void): void | Promise<DSInfoResponse> {
        return this.connection.get(this.url + SYS_INFO, undefined, callback);
    }

    public getDevice(uuid: string): Promise<DeviceResponse>;
    public getDevice(uuid: string, callback: (error: CoreExceptions.RestException, data: DeviceResponse) => void): void;
    public getDevice(uuid: string,
                     callback?: (error: CoreExceptions.RestException, data: DeviceResponse) => void): void | Promise<DeviceResponse> {
        return this.connection.get(this.url + DEVICE + SEPARATOR + uuid, undefined, callback);
    }

    public getJWT(): Promise<JWTResponse>;
    public getJWT(callback: (error: CoreExceptions.RestException, data: JWTResponse) => void): void;
    public getJWT(callback?: (error: CoreExceptions.RestException, data: JWTResponse) => void): void | Promise<JWTResponse> {
        let self = this;

        if (callback) {
            doGetJwt();
        } else {
            // promise
            return new Promise((resolve, reject) => {
                doGetJwt(resolve, reject);
            });
        }

        function doGetJwt(resolve?: (data: any) => void, reject?: (data: any) => void) {
            self.connection.get(self.url + SECURITY_JWT_ISSUE, undefined).then(data => {
                if (data && data.token) { self.cfg.jwt = data.token; }
                if (callback) { return callback(null, data); }
                else { resolve(data); }
            }, error => {
                if (callback) { return callback(error, null); }
                else { reject(error); }
            });
        }
    }

    public refreshJWT(): Promise<JWTResponse>;
    public refreshJWT(callback: (error: CoreExceptions.RestException, data: JWTResponse) => void): void;
    public refreshJWT(callback?: (error: CoreExceptions.RestException, data: JWTResponse) => void): void | Promise<JWTResponse> {
        let actualJWT = this.cfg.jwt;
        if (actualJWT) {
            return this.connection.post(this.url + SECURITY_JWT_REFRESH, { originalJWT: actualJWT }, undefined, callback);
        } else {
            let error = { code: "500", description: "No JWT available", status: 412 };
            if (callback) { return callback(error, null); }
            else { return Promise.reject(error); }
        }
    }

    public getPubKey(): Promise<DSPubKeyResponse>;
    public getPubKey(callback: (error: CoreExceptions.RestException, data: DSPubKeyResponse) => void): void;
    public getPubKey(callback?: (error: CoreExceptions.RestException, data: DSPubKeyResponse) => void): void | Promise<DSPubKeyResponse> {
        return this.connection.get(this.url + PUB_KEY, undefined, callback);
    }

    public downloadLink(infoBrowser: BrowserInfoResponse): Promise<DownloadLinkResponse>;
    public downloadLink(infoBrowser: BrowserInfoResponse,
                        callback: (error: CoreExceptions.RestException, data: DownloadLinkResponse) => void): void;
    public downloadLink(infoBrowser: BrowserInfoResponse,
                        callback?: (error: CoreExceptions.RestException,
                                    data: DownloadLinkResponse) => void): void | Promise<DownloadLinkResponse> {
        let self = this;
        if (callback) {
            doGetDownloadLink();
        } else {
            // promise
            return new Promise((resolve, reject) => {
                doGetDownloadLink(resolve, reject);
            });
        }
        function doGetDownloadLink(resolve?: (data: any) => void, reject?: (data: any) => void) {
            self.connection.post(self.url + DOWNLOAD, infoBrowser, undefined).then(data => {
                let returnObject = { url: self.cfg.dsUrlBase + data.path + QP_APIKEY + self.cfg.apiKey };
                if (callback && typeof callback === "function") { return callback(null, returnObject); }
                else { return resolve(returnObject); }
            }, err => {
                if (callback && typeof callback === "function") { return callback(err, null); }
                else { reject(err); }
            });
        }
    }

    public register(info: DSPlatformInfo, device_id: string): Promise<JWTResponse>;
    public register(info: DSPlatformInfo, device_id: string,
                    callback: (error: CoreExceptions.RestException, data: JWTResponse) => void): void;
    public register(info: DSPlatformInfo, device_id: string,
                    callback?: (error: CoreExceptions.RestException, data: JWTResponse) => void): void | Promise<JWTResponse> {
        let req = _.merge({ uuid: device_id, version: info.core_version }, _.omit(info, "core_version"));
        return this.connection.put(this.url + DEVICE + SEPARATOR + device_id, req, undefined, callback);
    }

    public sync(info: DSPlatformInfo, device_id: string): Promise<JWTResponse>;
    public sync(info: DSPlatformInfo, device_id: string, callback: (error: CoreExceptions.RestException, data: JWTResponse) => void): void;
    public sync(info: DSPlatformInfo, device_id: string,
                callback?: (error: CoreExceptions.RestException, data: JWTResponse) => void): void | Promise<JWTResponse> {
        let req = _.merge({ uuid: device_id, version: info.core_version }, _.omit(info, "core_version"));
        return this.connection.post(this.url + DEVICE + SEPARATOR + device_id, req, undefined, callback);
    }

}
