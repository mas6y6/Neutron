import { SafeWsRequest } from "./utils";
import WebSocket from "ws";

export class ZariumClient {
    public sessionId: string;
    public ws: WebSocket;

    constructor(ws: WebSocket, req: SafeWsRequest) {
        this.sessionId = <string>req.user?.sessionId;
        this.ws = ws;
    }
}
