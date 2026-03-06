import {NeutronServer} from "../NeutronServer";
import {renderTemplate} from "../Renderer";
import {SafeRequest, safeRoute} from "../utils";
const server:NeutronServer = NeutronServer.getInstance();

safeRoute(server.app, '/', 'get', async (req: SafeRequest,res) => {
    res.send(await renderTemplate("index.html", { csrfToken: (req as any).csrfToken() }))
});

safeRoute(server.app, '/api/status', 'get', async (req: SafeRequest,res) => {
    res.send({
        version: server.version,
        motd: server.motd,
        serverTitle: server.serverTitle,
        firstStart: server.firstStart,
        ssl_enabled: server.config.ssl_enabled
    })
});