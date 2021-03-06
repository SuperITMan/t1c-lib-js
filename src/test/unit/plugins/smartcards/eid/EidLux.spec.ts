/**
 * @author Maarten Somers
 * @since 2017
 */

import { expect } from 'chai';
import * as axios from 'axios';
import * as MockAdapter from 'axios-mock-adapter';
import { GCLConfig } from '../../../../../scripts/core/GCLConfig';
import { LocalConnection } from '../../../../../scripts/core/client/Connection';
import { PluginFactory } from '../../../../../scripts/plugins/PluginFactory';
import { AbstractEidLUX } from '../../../../../scripts/plugins/smartcards/eid/lux/EidLuxModel';
import { PubKeyService } from '../../../../../scripts/util/PubKeyService';

describe('Luxembourg eID Container', () => {
    const gclConfig = new GCLConfig({});
    const connection: LocalConnection = new LocalConnection(gclConfig);
    PubKeyService.setPubKey('MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDlOJu6TyygqxfWT7eLtGDwajtN\n' +
                            'FOb9I5XRb6khyfD1Yt3YiCgQWMNW649887VGJiGr/L5i2osbl8C9+WJTeucF+S76\n' +
                            'xFxdU6jE0NQ+Z+zEdhUTooNRaY5nZiu5PgDB0ED/ZKBUSLKL7eibMxZtMlUDHjm4\n' +
                            'gwQco1KRMDSmXSMkDwIDAQAB\n');
    const lux: AbstractEidLUX = new PluginFactory('', connection).createEidLUX('123', '1234');
    let mock: MockAdapter;

    beforeEach(() => {
        mock = new MockAdapter(axios);
        mock.onGet('https://localhost:10443/v2/card-readers/123').reply(() => {
            return [ 200, { data: { pinpad: false }, success: true }];
        });
    });

    afterEach(() => {
        mock.restore();
    });

    describe('allData', function () {
        beforeEach(function () {
            mock.onGet('containers/luxeid/123').reply((config) => {
                let headers = config.headers;
                if (headers['X-Encrypted-Pin'] && headers['X-Encrypted-Pin'].length) {
                    return [ 200, { data: { authentication_certificate: 'All Data' }, success: true }];
                } else {
                    return [ 404 ];
                }
            });
        });

        it('makes the correct call for allData', () => {
            return lux.allData({ filters: [], parseCerts: false }).then(res => {
                expect(res).to.have.property('success');
                expect(res.success).to.be.a('boolean');
                expect(res.success).to.eq(true);

                expect(res).to.have.property('data');
                expect(res.data).to.have.property('authentication_certificate');
                expect(res.data.authentication_certificate).to.have.property('base64');
                expect(res.data.authentication_certificate.base64).to.be.a('string');
                expect(res.data.authentication_certificate.base64).to.eq('All Data');
            });
        });
    });

    describe('allCerts', function () {
        beforeEach(function () {
            mock.onGet('containers/luxeid/123/certificates').reply((config) => {
                let headers = config.headers;
                if (headers['X-Encrypted-Pin'] && headers['X-Encrypted-Pin'].length) {
                    return [ 200, { data: { authentication_certificate: 'AllCert Data' }, success: true }];
                } else {
                    return [ 404 ];
                }
            });
        });

        it('makes the correct call for allData', () => {
            return lux.allCerts({ filters: [], parseCerts: false }).then(res => {
                expect(res).to.have.property('success');
                expect(res.success).to.be.a('boolean');
                expect(res.success).to.eq(true);

                expect(res).to.have.property('data');
                expect(res.data).to.have.property('authentication_certificate');
                expect(res.data.authentication_certificate).to.have.property('base64');
                expect(res.data.authentication_certificate.base64).to.be.a('string');
                expect(res.data.authentication_certificate.base64).to.eq('AllCert Data');
            });
        });
    });

    describe('biometric', function () {
        beforeEach(function () {
            mock.onGet('containers/luxeid/123/biometric').reply((config) => {
                let headers = config.headers;
                if (headers['X-Encrypted-Pin'] && headers['X-Encrypted-Pin'].length) {
                    return [ 200, { data: 'Biometric Data', success: true }];
                } else {
                    return [ 404 ];
                }
            });
        });

        it('makes the correct call for biometric data', () => {
            return lux.biometric().then(res => {
                expect(res).to.have.property('success');
                expect(res.success).to.be.a('boolean');
                expect(res.success).to.eq(true);

                expect(res).to.have.property('data');
                expect(res.data).to.be.a('string');
                expect(res.data).to.eq('Biometric Data');
            });
        });
    });

    describe('picture', function () {
        beforeEach(function () {
            mock.onGet('containers/luxeid/123/picture').reply((config) => {
                let headers = config.headers;
                if (headers['X-Encrypted-Pin'] && headers['X-Encrypted-Pin'].length) {
                    return [ 200, { data: 'Picture Data', success: true }];
                } else {
                    return [ 404 ];
                }
            });
        });

        it('makes the correct call for picture data', () => {
            return lux.picture().then(res => {
                expect(res).to.have.property('success');
                expect(res.success).to.be.a('boolean');
                expect(res.success).to.eq(true);

                expect(res).to.have.property('data');
                expect(res.data).to.be.a('string');
                expect(res.data).to.eq('Picture Data');
            });
        });
    });

    describe('getCertificate', function () {
        beforeEach(function () {
            mock.onGet('containers/luxeid/123/certificates/authentication').reply((config) => {
                let headers = config.headers;
                if (headers['X-Encrypted-Pin'] && headers['X-Encrypted-Pin'].length) {
                    return [ 200, { data: 'Auth Cert Data', success: true }];
                } else {
                    return [ 404 ];
                }
            });
        });

        it('makes the correct call for a certificate', () => {
            return lux.authenticationCertificate({ parseCerts: false }).then(res => {
                expect(res).to.have.property('success');
                expect(res.success).to.be.a('boolean');
                expect(res.success).to.eq(true);

                expect(res).to.have.property('data');
                expect(res.data).to.have.property('base64').eq('Auth Cert Data');
            });
        });
    });

    describe('getCertificateArray', function () {
        beforeEach(function () {
            mock.onGet('containers/luxeid/123/certificates/root').reply((config) => {
                let headers = config.headers;
                if (headers['X-Encrypted-Pin'] && headers['X-Encrypted-Pin'].length) {
                    return [ 200, { data: ['Cert 1', 'Cert 2'], success: true }];
                } else {
                    return [ 404 ];
                }
            });
        });

        it('makes the correct call for a certificate array data', () => {
            return lux.rootCertificate({ parseCerts: false }).then(res => {
                expect(res).to.have.property('success');
                expect(res.success).to.be.a('boolean');
                expect(res.success).to.eq(true);

                expect(res).to.have.property('data');
                expect(res.data).to.be.a('array');
                expect(res.data[0]).to.have.property('base64').eq('Cert 1');
                expect(res.data[1]).to.have.property('base64').eq('Cert 2');
            });
        });
    });

    describe('signatureImage', function () {
        beforeEach(function () {
            mock.onGet('containers/luxeid/123/signature-image').reply((config) => {
                let headers = config.headers;
                if (headers['X-Encrypted-Pin'] && headers['X-Encrypted-Pin'].length) {
                    return [ 200, { data: 'Signature Image Data', success: true }];
                } else {
                    return [ 404 ];
                }
            });
        });

        it('makes the correct call for signature image data', () => {
            return lux.signatureImage().then(res => {
                expect(res).to.have.property('success');
                expect(res.success).to.be.a('boolean');
                expect(res.success).to.eq(true);

                expect(res).to.have.property('data');
                expect(res.data).to.be.a('string');
                expect(res.data).to.eq('Signature Image Data');
            });
        });
    });

    describe('verifyPin', function () {
        beforeEach(function () {
            mock.onPost('containers/luxeid/123/verify-pin').reply((config) => {
                let data = JSON.parse(config.data);
                let headers = config.headers;
                if (headers['X-Encrypted-Pin'] && headers['X-Encrypted-Pin'].length && data && data.pin && data.pin.length) {
                    return [ 200, { data: 'Verify Pin Data', success: true }];
                } else {
                    return [ 404 ];
                }
            });
        });

        it('makes the correct call to verify pin', () => {
            return lux.verifyPin({ pin: '1234' }).then(res => {
                expect(res).to.have.property('success');
                expect(res.success).to.be.a('boolean');
                expect(res.success).to.eq(true);

                expect(res).to.have.property('data');
                expect(res.data).to.be.a('string');
                expect(res.data).to.eq('Verify Pin Data');
            });
        });
    });


    describe('authenticate', function () {
        beforeEach(function () {
            mock.onPost('containers/luxeid/123/authenticate').reply((config) => {
                let data = JSON.parse(config.data);
                let headers = config.headers;
                if (headers['X-Encrypted-Pin'] && headers['X-Encrypted-Pin'].length && data && data.pin && data.pin.length) {
                    return [ 200, { data: 'Authenticate Data', success: true }];
                } else {
                    return [ 404 ];
                }
            });
        });

        it('makes the correct call to authenticate', () => {
            return lux.authenticate({ pin: '1234' }).then(res => {
                expect(res).to.have.property('success');
                expect(res.success).to.be.a('boolean');
                expect(res.success).to.eq(true);

                expect(res).to.have.property('data');
                expect(res.data).to.be.a('string');
                expect(res.data).to.eq('Authenticate Data');
            });
        });
    });

    describe('signData', function () {
        beforeEach(function () {
            mock.onPost('containers/luxeid/123/sign').reply((config) => {
                let data = JSON.parse(config.data);
                let headers = config.headers;
                if (headers['X-Encrypted-Pin'] && headers['X-Encrypted-Pin'].length && data && data.pin && data.pin.length) {
                    return [ 200, { data: 'Sign Data', success: true }];
                } else {
                    return [ 404 ];
                }
            });
        });

        it('makes the correct call to sign data', () => {
            return lux.signData({ pin: '1234' }).then(res => {
                expect(res).to.have.property('success');
                expect(res.success).to.be.a('boolean');
                expect(res.success).to.eq(true);

                expect(res).to.have.property('data');
                expect(res.data).to.be.a('string');
                expect(res.data).to.eq('Sign Data');
            });
        });
    });
});
