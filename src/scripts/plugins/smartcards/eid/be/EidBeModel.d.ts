import { RestException } from "../../../../core/exceptions/CoreExceptions";
import { CertCard } from "../../Card";
import { DataObjectResponse, DataResponse } from "../../../../core/service/CoreModel";
export { AbstractEidBE, Address, AddressResponse, AllCertsResponse, AllDataResponse, RnData, RnDataResponse };
interface AbstractEidBE extends CertCard {
    allData(filters: string[], callback: (error: RestException, data: AllDataResponse) => void): void;
    allCerts(filters: string[], callback: (error: RestException, data: AllCertsResponse) => void): void;
    rnData(callback: (error: RestException, data: RnDataResponse) => void): void;
    address(callback: (error: RestException, data: AddressResponse) => void): void;
    picture(callback: (error: RestException, data: DataResponse) => void): void;
    rootCertificate(callback: (error: RestException, data: DataResponse) => void): void;
    citizenCertificate(callback: (error: RestException, data: DataResponse) => void): void;
    authenticationCertificate(callback: (error: RestException, data: DataResponse) => void): void;
    nonRepudiationCertificate(callback: (error: RestException, data: DataResponse) => void): void;
    rrnCertificate(callback: (error: RestException, data: DataResponse) => void): void;
}
interface AddressResponse extends DataObjectResponse {
    data: Address;
}
interface Address {
    municipality: string;
    raw_data: string;
    signature: string;
    street_and_number: string;
    version: number;
    zipcode: string;
}
interface AllCertsResponse extends DataObjectResponse {
    data: {
        authentication_certificate?: string;
        citizen_certificate?: string;
        non_repudiation_certificate?: string;
        root_certificate?: string;
        rrn_certificate?: string;
    };
}
interface AllDataResponse extends AllCertsResponse {
    data: {
        address?: Address;
        authentication_certificate?: string;
        citizen_certificate?: string;
        non_repudiation_certificate?: string;
        picture?: string;
        rn?: RnData;
        root_certificate?: string;
        rrn_certificate?: string;
    };
}
interface RnData {
    birth_date: string;
    birth_location: string;
    card_delivery_municipality: string;
    card_number: string;
    card_validity_date_begin: string;
    card_validity_date_end: string;
    chip_number: string;
    document_type: string;
    first_names: string;
    name: string;
    national_number: string;
    nationality: string;
    noble_condition: string;
    picture_hash: string;
    raw_data: string;
    sex: string;
    signature: string;
    special_status: string;
    third_name: string;
    version: number;
}
interface RnDataResponse extends DataObjectResponse {
    data: RnData;
}