import {expect} from "chai";
import {AbstractDSClient,DSClient} from "../../scripts/core/ds/DSClient";
import {RemoteConnection} from "../../scripts/core/client/Connection";

describe('DSClient', () => {
    let dsUnderTest = "http://localhost:8080/gcl-ds-web/v1";
    let remoteConnection:RemoteConnection;
    let dsClient:DSClient;

    beforeEach(() => {
        remoteConnection = new RemoteConnection();
        dsClient = new DSClient(dsUnderTest,remoteConnection);
    });

    describe('DSClient Service Expectations', () => {

        it('should verify that a ds client has been instantiated', () => {
            expect(dsClient).not.undefined;
        });

        it('should return the url for DS under test', () => {
            expect(dsClient.getUrl()).to.equals(dsUnderTest);
        });

        it('should return information for the distribution service', (done) => {
            dsClient.getInfo(function(err,data){
                expect(err).to.be.null;
                expect(data).to.exist;
                done();
            });
        });

        it('should get device information when UUID is given', (done) => {
            done();
        });

        it('should fail to get device info without providing UUID param', (done) => {
            done();
        });

        it('should get a JWT token', (done) => {
            dsClient.getJWT(function(err,data){
                expect(err).to.be.null;
                expect(data).to.exist;
                expect(data.token).to.exist;
               done();
            });
        });

        it('should refresh an existing valid JWT with a new expiration time - greater then the former', (done) => {
            done();
        });

        it('should fail to get a JWT token when given JWT is expired', (done) => {
            done();
        });

        it('should fail to get a JWT token when given JWT is expired', (done) => {
            done();
        });

        it('should get a public key', (done) => {
            done();
        });

        it('should get a valid download link', (done) => {
            done();
        });

        it('should register a new device when not activated and un-registered', (done) => {
            done();
        });

        it('should register a new device when activated and un-registered', (done) => {
            done();
        });

        it('should sync a given device when activated and registered', (done) => {
            done();
        });

        it('should sync a given device when not activated and registered', (done) => {
            done();
        });
    });
});