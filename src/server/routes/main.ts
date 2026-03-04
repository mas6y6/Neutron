import {NeutronServer} from "../NeutronServer";
import {renderTemplate} from "../Renderer";
import { v4 as uuidv4 } from "uuid";
const server:NeutronServer = NeutronServer.getInstance();

server.app.get('/',async (req,res) => {
    res.send(await renderTemplate("index.html"))
});

server.registerWsRoute("/api/handshake", (ws, req) => {
    const id = uuidv4();

    ws.send(id);
    ws.send(server.publicKey!.export({ type: "spki", format: "pem" }));

    ws.on("message", (msg) => {
        try {
            const data = JSON.parse(msg.toString());

            if (data.type === "ping") {
                if (server.clientPublicKeys[id]) {
                    server.clientPublicKeys[id].lastPing = Date.now();
                }
                return;
            }

            if (data.clientID && data.publicKey) {
                server.clientPublicKeys[id] = {
                    publicKey: data.publicKey,
                    ws,
                    lastPing: Date.now(),
                };
            }
        } catch {
        }
    });

    ws.on("close", () => {
        delete server.clientPublicKeys[id];
    });
});