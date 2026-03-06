import {RawData, WebSocket} from "ws";
import jwt from "jsonwebtoken";
import express, {Application, ErrorRequestHandler, RequestHandler, Router} from "express";
import {NeutronServer} from "./NeutronServer";

export function waitForMessage(ws: WebSocket): Promise<string> {
    return new Promise((resolve) => {
        const handler = (msg: RawData) => {
            ws.off("message", handler); // remove listener after first message
            resolve(msg.toString());
        };
        ws.on("message", handler);
    });
}


type HttpMethod = "get" | "post" | "put" | "delete" | "patch" | "options" | "head";

export function handleCSRF(target: Application | Router) {
    const csrfHandler: ErrorRequestHandler = (err, req, res, next) => {
        if (err.code !== "EBADCSRFTOKEN") return next(err);
        res.status(403).json({ detail: "Invalid CSRF token" });
    };

    target.use(csrfHandler);
}

export function handleErrors(target: Application | Router) {
    const notFound: RequestHandler = (req, res) => {
        res.status(404).json({ detail: "Not Found" });
    };
    target.use(notFound);

    const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
        console.error(err);
        res.status(err.status || 500).json({
            detail: err.message || "Internal Server Error",
        });
    };
    target.use(errorHandler);
}

export function requireJson(req: express.Request, res: express.Response) {
    if (req.headers['content-type'] !== "application/json") {
        res.status(400).json({ detail: "Invalid content type." });
        return false;
    }
    return true;
}

interface JwtPayload {
    userId: number;
}

export interface SafeRequest extends express.Request {
    user?: JwtPayload | null;
}

export function safeRoute(
    app: express.Application,
    path: string,
    method: HttpMethod,
    handler: RequestHandler,
    options = { require_auth: false }
) {
    const wrappedHandler: RequestHandler = options.require_auth
        ? (req: SafeRequest, res, next) => {
            let token: string | undefined;

            const authHeader = req.headers.authorization;
            if (authHeader?.startsWith("Bearer ")) {
                token = authHeader.split(" ")[1];
            } else if (req.cookies?.["access-token"]) {
                token = req.cookies["access-token"];
            }

            if (!token) return res.status(401).json({ detail: "Missing access token" });

            // TODO: Actually check if the token is valid

            try {
                req.user = jwt.verify(token, NeutronServer.getInstance().ACCESS_TOKEN_SECRET) as JwtPayload;
                handler(req, res, next);
            } catch {
                return res.status(401).json({ detail: "Invalid or expired token" });
            }
        }
        : handler;

    app[method](path, wrappedHandler);

    const allMethods: HttpMethod[] = ["get", "post", "put", "delete", "patch", "options", "head"];
    allMethods
        .filter(m => m !== method)
        .forEach(m => {
            app[m](path, (req, res) => {
                res.set("Allow", method.toUpperCase());
                res.status(405).json({ detail: "Method Not Allowed" });
            });
        });
}