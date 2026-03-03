import {NeutronServer} from "../NeutronServer";
import {renderTemplate} from "../Renderer";
const server:NeutronServer = NeutronServer.getInstance();

server.app.get('/',async (req,res) => {
    res.send(await renderTemplate("index.html"))
});

