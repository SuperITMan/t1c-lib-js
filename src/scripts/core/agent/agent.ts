/**
 * @author Maarten Somers
 */
import { RestException } from '../exceptions/CoreExceptions';
import { AbstractAgent, AgentResponse } from './agentModel';
import { LocalConnection } from '../client/Connection';
import { Promise } from 'es6-promise';

export { AgentClient };

class AgentClient implements AbstractAgent {
    static AGENT_PATH = '/agent';

    // constructor
    constructor(private url: string, private connection: LocalConnection) {}

    public static urlPrefix(port: number) {
        return AgentClient.AGENT_PATH + '/' + port;
    }

    public get(filters?: { [filterParam: string]: string },
               callback?: (error: RestException, data: AgentResponse) => void): Promise<AgentResponse> {
        return this.connection.getSkipCitrix(this.url, AgentClient.AGENT_PATH, filters, callback);
    }

}
