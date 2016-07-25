/**
 * TODO Add documentation!
 *
 * @author Maarten Casteels
 * @autho Michallis Pashidis
 * @since 2016
 */
import {Promise} from "es6-promise";

interface Connection {
    get(url:string, body?:any):Promise<any>;
    post(url:string, body?:any):Promise<any>;
}

class LocalConnection implements Connection {

    constructor() {}

    private request(method:string, url:string, body:any):Promise<any> {
        return new Promise<any>((resolve, reject) => {
            let xmlHttp:XMLHttpRequest = new XMLHttpRequest();
            xmlHttp.onreadystatechange = () => {
                if (xmlHttp.readyState === 4) {
                    if (xmlHttp.status === 200) {
                        if (xmlHttp.responseText && xmlHttp.responseText.length > 0) {
                            resolve(JSON.parse(xmlHttp.responseText));
                        } else {
                            resolve('');
                        }
                    } else {
                        reject(JSON.parse(xmlHttp.responseText));
                    }
                }
            };
            xmlHttp.onerror = function (e) {
                reject(e);
            };
            xmlHttp.open(method, url, true); // true for asynchronous
            if (method === 'POST') {
                xmlHttp.setRequestHeader('Content-Type', 'application/json');
            }
            xmlHttp.send(body);
        });
    }


    public get(url:string, body?:any):Promise<any> {
        $.getJSON( url, function( data ) {
            console.log("jquery data: "+JSON.stringify(data));
        });
        return this.request('GET', url, body || '');
    }

    public post(url:string, body?:any):Promise<any> {
        return this.request('POST', url, body || '');
    }
}

export const connection = new LocalConnection();
