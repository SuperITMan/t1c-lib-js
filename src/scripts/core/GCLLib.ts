/**
 * @author Maarten Casteels
 * @author Michallis Pashidis
 * @author Maarten Somers
 * @since 2016
 */
import * as CoreExceptions from "./exceptions/CoreExceptions";
import * as _ from "lodash";
import * as jwtDecode from "jwt-decode";


import { GCLConfig } from "./GCLConfig";
import { CardFactory } from "../plugins/smartcards/CardFactory";
import { CoreService } from "./service/CoreService";
import { LocalConnection, RemoteConnection, LocalAuthConnection, LocalTestConnection } from "./client/Connection";
import { AbstractDSClient, DownloadLinkResponse, JWTResponse } from "./ds/DSClientModel";
import { DSClient } from "./ds/DSClient";
import { AbstractOCVClient, OCVClient } from "./ocv/OCVClient";
import { InfoResponse, Container } from "./service/CoreModel";
import { AbstractEidBE } from "../plugins/smartcards/eid/be/EidBeModel";
import { AbstractEMV } from "../plugins/smartcards/emv/EMVModel";
import { AbstractOcra } from "../plugins/smartcards/ocra/ocraModel";
import { AbstractAventra } from "../plugins/smartcards/pki/aventra/AventraModel";
import { AbstractLuxTrust } from "../plugins/smartcards/pki/luxtrust/LuxTrustModel";
import { AbstractOberthur } from "../plugins/smartcards/pki/oberthur/OberthurModel";
import { AbstractPiv } from "../plugins/smartcards/piv/pivModel";
import { AbstractMobib } from "../plugins/smartcards/mobib/mobibModel";
import { AbstractEidLUX } from "../plugins/smartcards/eid/lux/EidLuxModel";
import { AbstractDNI } from "../plugins/smartcards/eid/esp/dniModel";
import { Promise } from "es6-promise";


class GCLClient {
    private cfg: GCLConfig;
    private cardFactory: CardFactory;
    private coreService: CoreService;
    private connection: LocalConnection;
    private authConnection: LocalAuthConnection;
    private remoteConnection: RemoteConnection;
    private localTestConnection: LocalTestConnection;
    private dsClient: DSClient;
    private ocvClient: OCVClient;

    constructor(cfg: GCLConfig, automatic?: boolean) {
        let self = this;
        // resolve config to singleton
        this.cfg = GCLClient.resolveConfig(cfg);
        // init communication
        this.connection = new LocalConnection(this.cfg);
        this.authConnection = new LocalAuthConnection(this.cfg);
        this.remoteConnection = new RemoteConnection(this.cfg);
        this.localTestConnection = new LocalTestConnection(this.cfg);
        this.cardFactory = new CardFactory(this.cfg.gclUrl, this.connection);
        this.coreService = new CoreService(this.cfg.gclUrl, this.authConnection);
        if (this.cfg.localTestMode) { this.dsClient = new DSClient(this.cfg.dsUrl, this.localTestConnection, this.cfg); }
        else { this.dsClient = new DSClient(this.cfg.dsUrl, this.remoteConnection, this.cfg); }
        this.ocvClient = new OCVClient(this.cfg.ocvUrl, this.remoteConnection);

        // check if implicit download has been set
        if (this.cfg.implicitDownload && true) { this.implicitDownload(); }

        if (!automatic) {
            // setup security - fail safe
            this.initSecurityContext()
                .then(() => { return Promise.resolve( { client: self }); })
                .then(self.registerAndActivate)
                .catch(err => {
                    console.log(JSON.stringify(err));
                    return;
                });
        }

        // verify OCV accessibility
        this.initOCVContext(function(err: {}) {
            if (err) {
                console.warn("OCV not available for apikey, contact support@trust1team.com to add this capability");
            } else { console.log("OCV available for apikey"); }
        });
    }

    public static initialize(cfg: GCLConfig): Promise<GCLClient>;
    public static initialize(cfg: GCLConfig,
                             readyCallback: (error: CoreExceptions.RestException, client: GCLClient) => void,
                             initializedCallback?: (error: CoreExceptions.RestException, client: GCLClient) => void): void;
    public static initialize(cfg: GCLConfig,
                             readyCallback?: (error: CoreExceptions.RestException, client: GCLClient) => void,
                             initializedCallback?: (error: CoreExceptions.RestException,
                                                    client: GCLClient) => void): void | Promise<GCLClient> {
        if (readyCallback && typeof readyCallback === "function") {
            init();
        } else {
            return new Promise((resolve, reject) => {
                init(resolve, reject);
            });
        }

        function init(resolve?: (data: any) => void, reject?: (error: any) => void) {
            let client = new GCLClient(cfg, true);
            if (initializedCallback && typeof initializedCallback === "function") { initializedCallback(null, client); }

            client.initSecurityContext()
                  .then(() => { return Promise.resolve({ client }); })
                  .then(client.registerAndActivate)
                  .then(jwt => { return Promise.resolve({ jwt, client }); })
                  .then(client.containerSync)
                  .then(() => {
                      if (resolve) { resolve(client); }
                      else { readyCallback(null, client); }
                  })
                  .catch(error => {
                      if (reject) { reject(error); }
                      else { readyCallback(error, null); }
                  });
        }
    }

    private static resolveConfig(cfg: GCLConfig) {
        // must be the base url because the GCLConfig object adds the context path and keeps the base url intact
        let resolvedCfg: GCLConfig = new GCLConfig(cfg.dsUrlBase, cfg.apiKey);
        resolvedCfg.allowAutoUpdate = cfg.allowAutoUpdate;
        resolvedCfg.client_id = cfg.client_id;
        resolvedCfg.client_secret = cfg.client_secret;
        resolvedCfg.jwt = cfg.jwt;
        resolvedCfg.gclUrl = cfg.gclUrl;
        resolvedCfg.implicitDownload = cfg.implicitDownload;
        resolvedCfg.localTestMode = cfg.localTestMode;
        return resolvedCfg;
    }

    // get core services
    public core = (): CoreService => { return this.coreService; };
    // get core config
    public config = (): GCLConfig => { return this.cfg; };
    // get ds client services
    public ds = (): AbstractDSClient => { return this.dsClient; };
    // get ocv client services
    public ocv = (): AbstractOCVClient => { return this.ocvClient; };
    // get instance for belgian eID card
    public beid = (reader_id?: string): AbstractEidBE => { return this.cardFactory.createEidBE(reader_id); };
    // get instance for spanish DNI card
    public dni = (reader_id?: string): AbstractDNI => { return this.cardFactory.createDNI(reader_id); };
    // get instance for luxemburg eID card
    public luxeid = (reader_id?: string, pin?: string): AbstractEidLUX => { return this.cardFactory.createEidLUX(reader_id, pin); };
    // get instance for luxtrust card
    public luxtrust = (reader_id?: string, pin?: string): AbstractLuxTrust => { return this.cardFactory.createLuxTrust(reader_id); };
    // get instance for EMV
    public emv = (reader_id?: string): AbstractEMV => { return this.cardFactory.createEmv(reader_id); };
    // get instance for MOBIB
    public mobib = (reader_id?: string): AbstractMobib => { return this.cardFactory.createMobib(reader_id); };
    // get instance for OCRA
    public ocra = (reader_id?: string): AbstractOcra => { return this.cardFactory.createOcra(reader_id); };
    // get instance for Aventra
    public aventra = (reader_id?: string): AbstractAventra => { return this.cardFactory.createAventraNO(reader_id); };
    // get instance for Oberthur
    public oberthur = (reader_id?: string): AbstractOberthur => { return this.cardFactory.createOberthurNO(reader_id); };
    // get instance for PIV
    public piv = (reader_id?: string): AbstractPiv => { return this.cardFactory.createPIV(reader_id); };

    /**
     * Init OCV - verify if OCV is available
     */
    private initOCVContext(cb: (error: any) => any) {
        return this.ocvClient.getInfo(cb);
    }

    /**
     * Init security context
     */
    private initSecurityContext() {
        let self = this;
        return new Promise((resolve, reject) => {
            self.core().getPubKey().then(key => {
                resolve(key);
            }, () => {
                self.dsClient.getPubKey().then(dsResponse => {
                    resolve(self.core().setPubKey(dsResponse.pubkey));
                }, dsError => {
                    reject(dsError);
                });
            });
        });
    }

    private registerAndActivate(args: { client: GCLClient}) {
        let self = args.client;
        let self_cfg = args.client.cfg;
        return new Promise((resolve, reject) => {
            // get GCL info
            self.core().info().then(infoResponse => {
                let activated = infoResponse.data.activated;
                let managed = infoResponse.data.managed;
                let core_version = infoResponse.data.version;
                let uuid = infoResponse.data.uid;
                // compose info
                let info = self.core().infoBrowserSync();
                let mergedInfo = _.merge({ managed, core_version, activated }, info.data);
                if (!activated) {
                    // we need to register the device
                    // console.log("Register device:"+uuid);
                    self.dsClient.register(mergedInfo, uuid).then((activationResponse: JWTResponse) => {
                        self_cfg.jwt = activationResponse.token;
                        self.core().activate().then(() => {
                            // sync
                            mergedInfo.activated = true;
                            self.dsClient.sync(mergedInfo, uuid).then(() => {
                                resolve(activationResponse.token);
                            }, (syncError: CoreExceptions.RestException) => {
                                console.log("Error while syncing the device: " + JSON.stringify(syncError));
                                reject(syncError);
                                return;
                            });
                        }, (error: CoreExceptions.RestException) => {
                            console.log(JSON.stringify(error));
                            reject(error);
                            return;
                        });
                    }, (error: CoreExceptions.RestException) => {
                        console.log("Error while registering the device: " + JSON.stringify(error));
                        reject(error);
                        return;
                    });
                } else {
                    // we need to synchronize the device
                    // console.log("Sync device:"+uuid);
                    self.dsClient.sync(mergedInfo, uuid).then(activationResponse => {
                        self_cfg.jwt = activationResponse.token;
                        resolve(activationResponse.token);
                        return;
                    }, syncError => {
                        console.log("Error while syncing the device: " + JSON.stringify(syncError));
                        reject(syncError);
                        return;
                    });
                }
            }, err => {
                console.log(JSON.stringify(err));
                reject(err);
                return;
            });
        });
    }

    private containerSync(args: { jwt: string, client: GCLClient}) {
        let numRetries = 0;
        const maxRetries = 3;
        return new Promise((resolve, reject) => {
            // parse JWT
            if (!args.jwt) { reject("Missing JWT, not activated?"); }
            else {
                // get required containers
                // let required = jwtDecode(jwt).containers;
                let required = jwtDecode(args.jwt).plugins;

                // TODO MAINTAIN BACKWARD COMPATIBILITY WITH GCL < V2
                args.client.core().containers().then(containers => {
                    if (containers.data) {
                        args.client.core().syncContainers(args.jwt).then(() => {
                            check(required, resolve, reject);
                        });
                    } else { resolve("Older GCL version without containers"); }
                });
            }
        });

        function check(required: Container[], resolve: (data: any) => void, reject: (data: any) => void) {
            // check status for required containers
            // get info
            args.client.core().info().then(res => {
                let errored = _.filter(res.data.containers, ct => {
                    return ct.status === "download_error";
                });
                let busy = _.filter(res.data.containers, ct => {
                    return ct.status === "init" || ct.status === "downloading";
                });

                // check for errored containers
                let containerError = _.find(errored, ct => {
                    return !!_.find(required, reqContainer => {
                        return reqContainer.name === ct.name;
                    });
                });
                if (containerError) {
                    // TODO improve retry mechanism
                    if (numRetries < maxRetries) {
                        args.client.core().syncContainers(args.jwt).then(() => {
                            numRetries++;
                            poll(required, resolve, reject);
                        });
                    } else {
                        // max # of retries reached, return error
                        reject("Error downloading one or more containers.");
                    }
                } else {
                    // check for downloading containers
                    let containerNotReady = _.find(busy, ct => {
                        return !!_.find(required, reqContainer => {
                            return reqContainer.name === ct.name;
                        });
                    });
                    if (containerNotReady) {
                        // downloads not yet complete, keep polling
                        poll(required, resolve, reject);
                    } else {
                        // all containers ok, resolve promise
                        resolve("download complete");
                    }
                }
            });
        }

        function poll(required: Container[], resolve: (data: any) => void, reject: (data: any) => void) {
            setTimeout(() => {
                check(required, resolve, reject);
            }, 1000);
        }
    }

    // implicit download GCL instance when not found
    private implicitDownload() {
        let self = this;
        this.core().info(function(error: CoreExceptions.RestException) {
            console.log("implicit error", JSON.stringify(error));
            if (error) {
                // no gcl available - start download
                let _info = self.core().infoBrowserSync();
                console.log("implicit error", JSON.stringify(_info));
                self.ds().downloadLink(_info, function(linkError: CoreExceptions.RestException, downloadResponse: DownloadLinkResponse) {
                    if (linkError) { console.error("could not download GCL package:", linkError.description); }
                    window.open(downloadResponse.url); return;
                });
            } else { return; }
        });
    }
}

export { GCLClient, GCLConfig };

