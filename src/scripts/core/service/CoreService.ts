/**
 * @author Michallis Pashidis
 * @author Maarten Somers
 */
import { Connection } from "../client/Connection";
import * as CoreExceptions from "../exceptions/CoreExceptions";
import * as _ from "lodash";
import * as platform from "platform";
import * as CoreModel from "./CoreModel";
import { Promise } from "es6-promise";
import { T1CResponse } from "./CoreModel";

export { CoreService };


const CORE_INFO = "/";
const CORE_READERS = "/card-readers";
const CORE_ACTIVATE = "/admin/activate";
const CORE_PUB_KEY = "/admin/certificate";
const CORE_CONTAINERS = "/admin/containers";

class CoreService implements CoreModel.AbstractCore {
    // constructor
    constructor(private url: string, private connection: Connection) {}

    private static cardInsertedFilter(inserted: boolean): {} {
        return { "card-inserted": inserted };
    }

    private static platformInfo(): CoreModel.BrowserInfoResponse {
        return {
            data: {
                manufacturer: platform.manufacturer || "",
                browser: {
                    name: platform.name,
                    version: platform.version
                },
                os: {
                    name: platform.os.family,
                    version: platform.os.version,
                    architecture: platform.os.architecture
                },
                ua: platform.ua
            },
            success: true
        };
    }

    private static successResponse(data: any, callback?: any): void | Promise<any> {
        if (callback && typeof callback === "function") { return callback(null, data); }
        else { return Promise.resolve(data); }
    }

    private static errorResponse(error: any, callback?: any): void | Promise<any> {
        if (callback && typeof callback === "function") { return callback(error); }
        else { return Promise.reject(error); }
    }

    // async
    public activate(): Promise<CoreModel.T1CResponse>;
    public activate(callback: (error: CoreExceptions.RestException, data: CoreModel.T1CResponse) => void): void;
    public activate(callback?: (error: CoreExceptions.RestException, data: CoreModel.T1CResponse)
        => void): void | Promise<CoreModel.T1CResponse> {
        return this.connection.post(this.url + CORE_ACTIVATE, {}, undefined, callback);
    }

    public getPubKey(): Promise<CoreModel.PubKeyResponse>;
    public getPubKey(callback: (error: CoreExceptions.RestException, data: CoreModel.PubKeyResponse) => void): void;
    public getPubKey(callback?: (error: CoreExceptions.RestException, data: CoreModel.PubKeyResponse)
        => void): void | Promise<CoreModel.PubKeyResponse> {
        return this.connection.get(this.url + CORE_PUB_KEY, undefined, callback);
    }

    public info(): Promise<CoreModel.InfoResponse>;
    public info(callback: (error: CoreExceptions.RestException, data: CoreModel.InfoResponse) => void): void;
    public info(callback?: (error: CoreExceptions.RestException, data: CoreModel.InfoResponse)
        => void): void | Promise<CoreModel.InfoResponse> {
        return this.connection.get(this.url + CORE_INFO, undefined, callback);
    }

    public infoBrowser(): Promise<CoreModel.BrowserInfoResponse>;
    public infoBrowser(callback: (error: CoreExceptions.RestException, data: CoreModel.BrowserInfoResponse) => void): void;
    public infoBrowser(callback?: (error: CoreExceptions.RestException, data: CoreModel.BrowserInfoResponse)
        => void): void | Promise<CoreModel.BrowserInfoResponse> {
        if (callback) { callback(null, CoreService.platformInfo()); }
        else { return Promise.resolve(CoreService.platformInfo()); }
    }

    public containers(): Promise<CoreModel.ContainersResponse>;
    public containers(callback: (error: CoreExceptions.RestException, data: CoreModel.ContainersResponse) => void): void;
    public containers(callback?: (error: CoreExceptions.RestException, data: CoreModel.ContainersResponse)
        => void): Promise<CoreModel.ContainersResponse> | void {
        return this.connection.get(this.url + CORE_INFO, undefined).then(res => {
            return CoreService.successResponse({ data: res.data.containers, success: true }, callback);
        }, err => {
            return CoreService.errorResponse(err, callback);
        });
    }

    public pollCardInserted(secondsToPollCard: number): Promise<CoreModel.CardReader>;
    public pollCardInserted(secondsToPollCard: number,
                            callback: (error: CoreExceptions.RestException, data: CoreModel.CardReader) => void,
                            connectReaderCb?: () => void,
                            insertCardCb?: () => void,
                            cardTimeoutCb?: () => void): void;
    public pollCardInserted(secondsToPollCard?: number,
                            callback?: (error: CoreExceptions.RestException, data: CoreModel.CardReader) => void,
                            connectReaderCb?: () => void,
                            insertCardCb?: () => void,
                            cardTimeoutCb?: () => void): void | Promise<CoreModel.CardReader> {
        let maxSeconds = secondsToPollCard || 30;
        let self = this;

        if (callback) {
            poll();
        } else {
            // promise
            return new Promise((resolve, reject) => {
                poll(resolve, reject);
            });
        }

        function poll(resolve?: (data: any) => void, reject?: (error: any) => void) {
            _.delay(() => {
                // console.debug("seconds left:", maxSeconds);
                --maxSeconds;
                self.readers((error: CoreExceptions.RestException, data: CoreModel.CardReadersResponse) => {
                    if (error) {
                        if (connectReaderCb) { connectReaderCb(); } // ask to connect reader
                        poll(resolve, reject); // no reader found and waiting - recursive call
                    }
                    // no error but stop
                    if (maxSeconds === 0) {
                        if (cardTimeoutCb) { return cardTimeoutCb(); }
                        else {
                            // TODO improve handling of timeout in combination with promises
                            if (reject) { reject({ success: false, message: "Timed out" }); }
                        }
                    } // reader timeout
                    else if (data.data.length === 0) {
                        if (connectReaderCb) { connectReaderCb(); } // ask to connect reader
                        poll(resolve, reject);
                    } else {
                        let readerWithCard = _.find(data.data, (reader: CoreModel.CardReader) => {
                            return _.has(reader, "card");
                        });
                        if (readerWithCard != null) {
                            if (resolve) { resolve(readerWithCard); }
                            else { return callback(null, readerWithCard); }
                        } else {
                            if (insertCardCb) { insertCardCb(); }
                            poll(resolve, reject);
                        }
                    }
                });
            }, 1000);
        }
    }

    public pollReadersWithCards(secondsToPollCard: number): Promise<CoreModel.CardReadersResponse>;
    public pollReadersWithCards(secondsToPollCard: number,
                                callback: (error: CoreExceptions.RestException, data: CoreModel.CardReadersResponse) => void,
                                connectReaderCb?: () => void,
                                insertCardCb?: () => void,
                                cardTimeoutCb?: () => void): void;
    public pollReadersWithCards(secondsToPollCard?: number,
                                callback?: (error: CoreExceptions.RestException, data: CoreModel.CardReadersResponse) => void,
                                connectReaderCb?: () => void,
                                insertCardCb?: () => void,
                                cardTimeoutCb?: () => void): void | Promise<CoreModel.CardReadersResponse> {
        let maxSeconds = secondsToPollCard || 30;
        let self = this;

        if (callback) {
            poll();
        } else {
            // promise
            return new Promise((resolve, reject) => {
                poll(resolve, reject);
            });
        }

        function poll(resolve?: (data: any) => void, reject?: (error: any) => void) {
            _.delay(() => {
                --maxSeconds;
                self.readers((error: CoreExceptions.RestException, data: CoreModel.CardReadersResponse) => {
                    if (error) {
                        if (connectReaderCb) { connectReaderCb(); }
                        poll(resolve, reject);
                    }
                    if (maxSeconds === 0) {
                        if (cardTimeoutCb) { return cardTimeoutCb(); }
                        else {
                            // TODO improve handling of timeout in combination with promises
                            if (reject) { reject({ success: false, message: "Timed out" }); }
                        }
                    } // reader timeout
                    else if (!_.isEmpty(data) && !_.isEmpty(data.data)) {
                        // there are some readers, check if one of them has a card
                        let readersWithCards = _.filter(data.data, (reader: CoreModel.CardReader) => {
                            return _.has(reader, "card");
                        });
                        if (readersWithCards.length) {
                            // reader with card found (at least one), return data
                            let response = { data: readersWithCards, success: true };
                            if (resolve) { resolve(response); }
                            else { return callback(null, response); }
                        } else {
                            // no readers with card found, continue polling
                            if (insertCardCb) { insertCardCb(); }
                            poll(resolve, reject);
                        }
                    } else {
                        // length is zero, no readers connected
                        if (connectReaderCb) { connectReaderCb(); }
                        poll(resolve, reject);
                    }
                });
            }, 1000);
        }
    }

    public pollReaders(secondsToPollReader: number): Promise<CoreModel.CardReadersResponse>;
    public pollReaders(secondsToPollReader: number,
                       callback: (error: CoreExceptions.RestException, data: CoreModel.CardReadersResponse) => void,
                       connectReaderCb?: () => void,
                       readerTimeoutCb?: () => void): void;
    public pollReaders(secondsToPollReader?: number,
                       callback?: (error: CoreExceptions.RestException, data: CoreModel.CardReadersResponse) => void,
                       connectReaderCb?: () => void,
                       readerTimeoutCb?: () => void): void | Promise<CoreModel.CardReadersResponse> {
        let maxSeconds = secondsToPollReader || 30;
        let self = this;

        if (callback) {
            poll();
        } else {
            // promise
            return new Promise((resolve, reject) => {
                poll(resolve, reject);
            });
        }


        function poll(resolve?: (data: any) => void, reject?: (error: any) => void) {
            _.delay(function () {
                --maxSeconds;
                self.readers(function(error: CoreExceptions.RestException, data: CoreModel.CardReadersResponse): void {
                    if (error) {
                        if (connectReaderCb) { connectReaderCb(); } // ask to connect reader
                        poll(resolve, reject); // no reader found and waiting - recursive call
                    }
                    // no error but stop
                    if (maxSeconds === 0) {
                        if (readerTimeoutCb) { return readerTimeoutCb(); } // reader timeout
                        else {
                            // TODO improve handling of timeout in combination with promises
                            if (reject) { reject({ success: false, message: "Timed out" }); }
                        }
                    }
                    else if (_.isEmpty(data) || _.isEmpty(data.data)) {
                        if (connectReaderCb) { connectReaderCb(); } // ask to connect reader
                        poll(resolve, reject);
                    }
                    else {
                        if (resolve) { resolve(data); }
                        else { return callback(null, data); }
                    }
                });
            }, 1000);
        }
    }

    public reader(reader_id: string): Promise<CoreModel.SingleReaderResponse>;
    public reader(reader_id: string, callback: (error: CoreExceptions.RestException, data: CoreModel.SingleReaderResponse) => void): void;
    public reader(reader_id: string,
                  callback?: (error: CoreExceptions.RestException, data: CoreModel.SingleReaderResponse)
                      => void): void | Promise<CoreModel.SingleReaderResponse> {
        return this.connection.get(this.url + CORE_READERS + "/" + reader_id, undefined, callback);
    }

    public readers(): Promise<CoreModel.CardReadersResponse>;
    public readers(callback: (error: CoreExceptions.RestException, data: CoreModel.CardReadersResponse) => void): void;
    public readers(callback?: (error: CoreExceptions.RestException, data: CoreModel.CardReadersResponse)
        => void): void | Promise<CoreModel.CardReadersResponse> {
        return this.connection.get(this.url + CORE_READERS, undefined, callback);
    }

    public readersCardAvailable(): Promise<CoreModel.CardReadersResponse>;
    public readersCardAvailable(callback: (error: CoreExceptions.RestException, data: CoreModel.CardReadersResponse) => void): void;
    public readersCardAvailable(callback?: (error: CoreExceptions.RestException, data: CoreModel.CardReadersResponse)
        => void): void | Promise<CoreModel.CardReadersResponse> {
        return this.connection.get(this.url + CORE_READERS, CoreService.cardInsertedFilter(true), callback);
    }

    public readersCardsUnavailable(): Promise<CoreModel.CardReadersResponse>;
    public readersCardsUnavailable(callback: (error: CoreExceptions.RestException, data: CoreModel.CardReadersResponse) => void): void;
    public readersCardsUnavailable(callback?: (error: CoreExceptions.RestException, data: CoreModel.CardReadersResponse)
        => void): void | Promise<CoreModel.CardReadersResponse> {
        return this.connection.get(this.url + CORE_READERS, CoreService.cardInsertedFilter(false), callback);
    }

    public setPubKey(pubkey: string): Promise<CoreModel.PubKeyResponse>;
    public setPubKey(pubkey: string, callback: (error: CoreExceptions.RestException, data: CoreModel.PubKeyResponse) => void): void;
    public setPubKey(pubkey: string,
                     callback?: (error: CoreExceptions.RestException, data: CoreModel.PubKeyResponse)
                         => void): void | Promise<CoreModel.PubKeyResponse> {
        return this.connection.put(this.url + CORE_PUB_KEY, { certificate: pubkey }, undefined, callback);
    }

    public syncContainers(jwt: string): Promise<T1CResponse> {
        return this.connection.post(this.url + CORE_CONTAINERS, { jwt }, undefined);
    }

    // sync
    public infoBrowserSync(): CoreModel.BrowserInfoResponse { return CoreService.platformInfo(); }
    public getUrl(): string { return this.url; }

    // get Lib version
    public version(): string {
        return "%%GULP_INJECT_VERSION%%";
    }
}
