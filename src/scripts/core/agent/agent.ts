/**
 * @author Maarten Somers
 */
import { RestException } from "../exceptions/CoreExceptions";
import { AbstractAgent, AgentResponse } from "./agentModel";
import { Connection } from "../client/Connection";


export { AgentClient };

class AgentClient implements AbstractAgent {
    static AGENT_PATH = "/agent";

    // constructor
    constructor(private url: string, private connection: Connection) {}

    public static urlPrefix(port: number) {
        return AgentClient.AGENT_PATH + port.toString();
    }

    private static createHostnameFilter(hostName: string) {
        if (hostName) { return { hostname: hostName }; }
        else { return {}; }
    }

    public get(hostName?: string, callback?: (error: RestException, data: AgentResponse) => void) {
        return this.connection.get(this.url + AgentClient.AGENT_PATH, AgentClient.createHostnameFilter(hostName), callback);
    }

}
