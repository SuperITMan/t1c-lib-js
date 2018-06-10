/**
 * @author Michallis Pashidis
 * @since 2017
 */
import { GenericContainer } from '../smartcards/Card';
import {AbstractFileExchange, AccessMode, FileAction, FileListResponse, FileResponse, FileSort, ListFilesRequest, ModalType, Page, TypeListResponse, TypeResponse} from './FileExchangeModel';
import { RestException } from '../../core/exceptions/CoreExceptions';
import {BoolDataResponse, DataArrayResponse, DataResponse} from '../../core/service/CoreModel';

export { FileExchange };


class FileExchange extends GenericContainer implements AbstractFileExchange {
    static DOWNLOAD = '/download';
    static FOLDER = '/folder';
    static UPLOAD = '/upload';
    static TYPE_CREATE = '/create-type';
    static TYPE_UPDATE = '/update-type';
    static TYPE_LIST = '/list-types';
    static TYPE_CONTENT_LIST = '/list-type-content';
    static TYPE_DELETE = '/delete-type';
    static TYPE_EXISTS = '/exists-type';
    static FILE_EXISTS = '/exists-file';


    copyFile(entity: string, fromType: string, toType: string, filename: string, newfilename: string, fromrelpath?: [string], torelpath?: [string], callback?: (error: RestException, data: FileResponse) => void): Promise<FileResponse> {
        return undefined;
    }

    createDir(entity: string, type: string, relpath: [string], recursive?: boolean, callback?: (error: RestException, data: FileResponse) => void): Promise<FileResponse> {
        return undefined;
    }

    // TODO add headers for i18n and security
    createType(entity: string, type: string, initabspath?: [string], showModal?: boolean, timeoutInSeconds?: number, callback?: (error: RestException, data: TypeResponse) => void): Promise<TypeResponse> {
        const show_modal: boolean = (showModal == null) ? undefined : showModal;
        const timeout: number = (timeoutInSeconds == null) ? 30 : timeoutInSeconds;
        const init_tabs_path = (initabspath == null) ? undefined : initabspath;
        return this.connection.post(this.baseUrl, this.containerSuffix(FileExchange.TYPE_CREATE), { entity, type, show_modal, timeout, init_tabs_path  }, undefined, undefined, callback);
    }

    createTypeDirs(entity: string, type: string, initrelpath: [string], showModal?: boolean, callback?: (error: RestException, data: FileListResponse) => void): Promise<FileListResponse> {
        return undefined;
    }

    deleteType(entity: string, type: string, callback?: (error: RestException, data: boolean) => void): Promise<boolean> {
        return this.connection.post(this.baseUrl, this.containerSuffix(FileExchange.TYPE_DELETE), { entity, type }, undefined, undefined, callback);
    }

    download(entity: string, type: string, file: ArrayBuffer, fileName: string, rel_path?: [string], implicit_creation_type?: boolean, notify_on_completion?: boolean,
             callback?: (error: RestException, data: FileListResponse) => void): Promise<DataResponse> {
        return this.connection.postFile(this.baseUrl, this.containerSuffix(FileExchange.DOWNLOAD), { entity, type, file, fileName, rel_path, implicit_creation_type, notify_on_completion }, undefined, callback);
    }

    existsFile(entity: string, type: string, relpath: [string], callback?: (error: RestException, data: BoolDataResponse) => void): Promise<BoolDataResponse> {
        return this.connection.post(this.baseUrl, this.containerSuffix(FileExchange.FILE_EXISTS), { entity, type, relpath }, undefined, undefined, callback);
    }

    existsType(entity: string, type: string, callback?: (error: RestException, data: BoolDataResponse) => void): Promise<BoolDataResponse> {
        return this.connection.post(this.baseUrl, this.containerSuffix(FileExchange.TYPE_EXISTS), { entity, type }, undefined, undefined, callback);
    }

    getAccessMode(entity: string, type: string, filename?: string, relpath?: [string], callback?: (error: RestException, data: AccessMode) => void): Promise<AccessMode> {
        return undefined;
    }

    getEnabledContainers(callback?: (error: RestException, data: DataArrayResponse) => void): Promise<DataArrayResponse> {
        return undefined;
    }

    getFileInfo(entity: string, type: string, filename: string, relpath?: [string], callback?: (error: RestException, data: FileResponse) => void): Promise<FileResponse> {
        return undefined;
    }

    getProgress(entity: string, type: String, filename?: String, action?: FileAction, callback?: (error: RestException, data: FileListResponse) => void): Promise<DataResponse> {
        return undefined;
    }

    listContent(entity: string, page?: Page, callback?: (error: RestException, data: FileListResponse) => void): Promise<FileListResponse> {
        return undefined;
    }

    listType(entity: string, type: string, callback?: (error: RestException, data: TypeResponse) => void): Promise<TypeResponse> {
        return undefined;
    }

    listTypeContent(entity: string, type: string, relpath?: [string], page?: Page, callback?: (error: RestException, data: FileListResponse) => void): Promise<FileListResponse> {
        let paging: Page;
        if (page) { paging = page; } else { paging = { start: 1, size: 10, sort: FileSort.ASC}; }
        return this.connection.post(this.baseUrl, this.containerSuffix(FileExchange.TYPE_CONTENT_LIST), { entity, type, paging }, undefined, undefined, callback);
    }

    listTypes(entity: string, page?: Page, callback?: (error: RestException, data: TypeListResponse) => void): Promise<TypeListResponse> {
        let paging: Page;
        if (page) { paging = page; } else { paging = { start: 1, size: 10, sort: FileSort.ASC}; }
        return this.connection.post(this.baseUrl, this.containerSuffix(FileExchange.TYPE_LIST), { entity, paging }, undefined, undefined, callback);
    }

    moveFile(entity: string, fromType: string, toType: string, filename: string, fromrelpath?: [string], torelpath?: [string], callback?: (error: RestException, data: FileResponse) => void): Promise<FileResponse> {
        return undefined;
    }

    renameFile(entity: string, type: string, filename: string, newfilename: string, relpath?: [string], callback?: (error: RestException, data: FileResponse) => void): Promise<FileResponse> {
        return undefined;
    }

    showModal(title: string, text: string, modal: ModalType, timeoutInSeconds?: number, callback?: (error: RestException, data: FileListResponse) => void): Promise<boolean> {
        return undefined;
    }

    updateType(entity: string, type: string, timeoutInSeconds?: number, callback?: (error: RestException, data: TypeResponse) => void): Promise<TypeResponse> {
        const timeout: number = (timeoutInSeconds == null) ? 30 : timeoutInSeconds;
        return this.connection.post(this.baseUrl, this.containerSuffix(FileExchange.TYPE_UPDATE), { entity, type, timeout  }, undefined, undefined, callback);
    }

    upload(entity: string, type: string, filename: string, relpath?: [string], notifyOnCompletion?: boolean, showProgressBar?: boolean, callback?: (error: RestException, data: FileListResponse) => void): Promise<ArrayBuffer> {
        return undefined;
    }


/*    public downloadFile(path: string, file: ArrayBuffer, fileName: string): Promise<DataResponse> {
        return this.connection.putFile(this.baseUrl, this.containerSuffix(FileExchange.DOWNLOAD), { path, file, fileName }, undefined);
    }


    public listFiles(data: ListFilesRequest, callback?: (error: RestException, data: FileListResponse) => void): Promise<FileListResponse> {
        return this.connection.post(this.baseUrl, this.containerSuffix(FileExchange.FOLDER), data, undefined, undefined, callback);
    }


    public setFolder(callback?: (error: RestException, data: DataResponse) => void): Promise<DataResponse> {
        return this.connection.get(this.baseUrl, this.containerSuffix(FileExchange.FOLDER), undefined, undefined, callback);
    }


    public uploadFile(path: string): Promise<ArrayBuffer> {
        return this.connection.requestFile(this.baseUrl, this.containerSuffix(FileExchange.UPLOAD), { path });
    }*/


}
