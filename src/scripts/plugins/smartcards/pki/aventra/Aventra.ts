/**
 * @author Michallis Pashidis
 * @author Maarten Somers
 * @since 2017
 */
import { RestException } from "../../../../core/exceptions/CoreExceptions";
import { DataResponse, T1CResponse } from "../../../../core/service/CoreModel";
import { GenericCertCard, ResetPinData, VerifyPinData } from "../../Card";
import { AbstractAventra} from "./AventraModel";
import { PinEnforcer } from "../../../../util/PinEnforcer";
import { Promise } from "es6-promise";

export { Aventra };


class Aventra extends GenericCertCard implements AbstractAventra {
    static RESET_PIN = "/reset-pin";

    // filters
    public allDataFilters() {
        return [ "applet-info", "root_certificate", "authentication-certificate",
                 "encryption_certificate", "issuer_certificate", "signing_certificate" ];
    }

    public allCertFilters() {
        return [ "root_certificate", "authentication-certificate", "encryption_certificate", "issuer_certificate", "signing_certificate" ];
    }

    public allKeyRefs() {
        return [ "authenticate", "sign", "encrypt" ];
    }

    public rootCertificate(callback?: (error: RestException, data: DataResponse) => void): Promise<DataResponse> {
        return this.getCertificate(Aventra.CERT_ROOT, callback);
    }

    public issuerCertificate(callback?: (error: RestException, data: DataResponse) => void): Promise<DataResponse> {
        return this.getCertificate(Aventra.CERT_ISSUER, callback);
    }

    public authenticationCertificate(callback?: (error: RestException, data: DataResponse) => void): Promise<DataResponse> {
        return this.getCertificate(Aventra.CERT_AUTHENTICATION, callback);
    }

    public signingCertificate(callback?: (error: RestException, data: DataResponse) => void): Promise<DataResponse> {
        return this.getCertificate(Aventra.CERT_SIGNING, callback);
    }

    public encryptionCertificate(callback?: (error: RestException, data: DataResponse) => void): Promise<DataResponse> {
        return this.getCertificate(Aventra.CERT_ENCRYPTION, callback);
    }

    public verifyPin(body: VerifyPinData, callback?: (error: RestException, data: T1CResponse) => void): Promise<T1CResponse> {
        return PinEnforcer.check(this.connection, this.baseUrl, this.reader_id, body.pin).then(() => {
            return this.connection.post(this.resolvedReaderURI() + Aventra.VERIFY_PIN, body, undefined, callback);
        });
    }

    public resetPin(body: ResetPinData, callback?: (error: RestException, data: T1CResponse) => void): Promise<T1CResponse> {
        return this.connection.post(this.resolvedReaderURI() + Aventra.RESET_PIN, body, undefined, callback);
    }
}
