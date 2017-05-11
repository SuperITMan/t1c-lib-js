/**
 * @author Michallis Pashidis
 * @author Maarten Somers
 * @since 2016
 */

import { AbstractEMV } from "./EMVModel";
import { RestException } from "../../../core/exceptions/CoreExceptions";
import { GenericPinCard } from "../Card";
import { DataResponse } from "../../../core/service/CoreModel";

export { EMV };


const EMV_PAN = "/pan";

class EMV extends GenericPinCard implements AbstractEMV {

    public pan(callback: (error: RestException, data: DataResponse) => void): void {
        this.connection.get(this.resolvedReaderURI() + EMV_PAN, callback);
    }

}