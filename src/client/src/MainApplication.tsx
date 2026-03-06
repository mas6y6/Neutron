import {animationCooldown, fetchWithCsrf} from "./utils";
import {SetupInit} from "./modals/setup";
import React from "react";
import {containerRef, notificationRef} from "./App";
import {LoadingModal} from "./UI";
import {LoginInit} from "./modals/login";

export async function MainApplication() {
    containerRef.current?.set(
        <LoadingModal />
    );

    let server_status = await (await fetchWithCsrf("/api/status")).json();
    if (!(server_status.ssl_enabled)) {
        if (window.location.protocol !== "https") {
            notificationRef.current?.add(
                {
                    title: "Warning",
                    content: "This server is not using SSL. This is not recommended for production.",
                    type: "warning"
                }
            )
        }
    }

    await animationCooldown();
    if (server_status.firstStart == true) {
        containerRef.current?.set(<SetupInit />);
    } else {
        await handleLogin(server_status);
    }
}

export async function handleLogin(server_status: any) {
    const res = await fetchWithCsrf("/api/verify_login", {
        method: "POST"
    });

    if (!res.ok) {
        if (res.status === 401) {
            containerRef.current?.set(<LoginInit title={server_status.serverTitle} motd={server_status.motd} version={server_status.version} />);
        } else {
            console.error(res);
            throw new Error("Failed to verify login");
        }
        return;
    }

    // if passed then actually render application
}