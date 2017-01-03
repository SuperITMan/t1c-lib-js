/**
 * @author Michallis Pashidis
 */
import {RemoteConnection} from "../client/Connection";
import * as CoreExceptions from "../exceptions/CoreExceptions";
import {RestException} from "../exceptions/CoreExceptions";
import {GCLConfig} from "../GCLConfig";

interface AbstractOCVClient{
    getChallenge(digestAlgorithm,callback:(error:CoreExceptions.RestException, data:any) => void):void;
    validateChallengeSignedHash(data:any,callback:(error:CoreExceptions.RestException, data:any) => void):void;
    validateCertificateChain(data:any,callback:(error:CoreExceptions.RestException, data:any) => void):void;
}

const DIGEST = "?digest=";
const CHALLENGE = "/challenge";
const CERTIFICATE = "/certs/validate-chain";


class OCVClient implements AbstractOCVClient{
    constructor(private url:string,private connection:RemoteConnection,private cfg:GCLConfig) {}
    public getUrl(){return this.url;}

    public getChallenge(digestAlgorithm, callback: (error: RestException, data: any)=>void): void {
        var consumerCb = callback;
        this.connection.get(this.url + CHALLENGE + DIGEST + digestAlgorithm, function(error, data){
            if(error)return consumerCb(error,null);
            return consumerCb(null,data);
        });
    }

    public validateChallengeSignedHash(data: any, callback: (error: RestException, data: any)=>void): void {
        let _req:any={};
        _req.base64Signature = data.base64Signature;
        _req.base64Certificate = data.base64Certificate;
        _req.hash = data.hash;
        _req.digestAlgorithm = data.digestAlgorithm;
        this.connection.post(this.url + CHALLENGE, _req, callback);
    }

    public validateCertificateChain(data: any, callback: (error: RestException, data: any)=>void): void {
        let _req:any={};
        _req.certificateChain = data.certificateChain;
        this.connection.post(this.url + CERTIFICATE, _req, callback);
    }

}



export {AbstractOCVClient,OCVClient}