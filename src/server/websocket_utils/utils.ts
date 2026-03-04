import {RawData, WebSocket} from "ws";

export function waitForMessage(ws: WebSocket): Promise<string> {
    return new Promise((resolve) => {
        const handler = (msg: RawData) => {
            ws.off("message", handler); // remove listener after first message
            resolve(msg.toString());
        };
        ws.on("message", handler);
    });
}