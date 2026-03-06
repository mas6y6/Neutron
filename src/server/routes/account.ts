import {NeutronServer} from "../NeutronServer";
import {SafeRequest, safeRoute} from "../utils";

const server:NeutronServer = NeutronServer.getInstance();

safeRoute(server.app, '/api/verify_login', 'post', async (req: SafeRequest,res) => {
    res.send({
        id: req.user?.userId
    }) // It may seem like it just returns it all the time but safeRoute will throw 401 if access_token doesnt exist or is invalid
},{
    require_auth: true
})

