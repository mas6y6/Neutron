import {NeutronServer} from "../NeutronServer";
import {renderTemplate} from "../Renderer";
import { v4 as uuidv4 } from "uuid";
import express from "express";
import {User} from "../database/entities/User";
import bcrypt from "bcrypt";
const server:NeutronServer = NeutronServer.getInstance();
const router = express.Router();

router.get('/',async (req,res) => {
    res.send(await renderTemplate("index.html", { csrfToken: (req as any).csrfToken() }))
});

router.get('/api/status',async (req,res) => {
    res.send({
        version: server.version,
        motd: server.motd,
        serverTitle: server.serverTitle,
        firstStart: server.firstStart,
        ssl_enabled: server.config.ssl_enabled
    })
});

router.post('/api/check-superadmin-key',async (req,res) => {
    if (!(server.firstStart)) {
        res.send({
            success: false,
            detail: "Server not in setup mode."
        })
    } else {
        if (req.headers['content-type'] !== "application/json") {
            res.status(400).send({
                detail: "Invalid content type."
            })
        }

        if (req.body.key !== server.superadminKey) {
            res.status(401).send({
                success: false,
                detail: "Invalid superadmin key."
            })
        } else {
            res.send({
                success: true,
                detail: "Superadmin key accepted."
            })
        }
    }
});

router.post('/api/create-superadmin',async (req,res) => {
    if (req.headers['content-type'] !== "application/json") {
        res.status(400).send({
            detail: "Invalid content type."
        })
    }

    if (!(server.firstStart)) {
        res.send({
            success: false,
            detail: "Server not in setup mode."
        })
    } else {
        if (!(req.body.superAdminKey === server.superadminKey)) {
            res.status(401).send({
                success: false,
                detail: "Invalid superadmin key."
            })
        }

        const userRepo = NeutronServer.getInstance().database.dataSource.getRepository(User);
        const passwordHash = await bcrypt.hash(req.body.password, 12);
        const user = userRepo.create({
            username: req.body.username,
            displayname: req.body.displayName,
            admin: true,
            superadmin: true,
            password: { password: passwordHash },
        });

        await userRepo.save(user);
        return res.send({
            detail: "Superadmin account created.",
            id: user.id
        })
    }
})

module.exports = router;