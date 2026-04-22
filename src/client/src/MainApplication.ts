import { useAppStore } from "./store";
import LoadingModal from "./components/LoadingModal.vue";
import { animationCooldown, fetchWithCsrf, loadVaultKey, logout } from "./utils";
import VaultSession from "./VaultSession";
import { h } from "vue";

// @ts-ignore
import { SuperAdminSetupInit } from "./modals/SuperAdminSetupInit.vue";
// @ts-ignore
import { LoginInit } from "./modals/LoginInit.vue";
// @ts-ignore
import { Accountbar, Groups } from "./Zarium.vue";

export let ws: WebSocket | null = null;

export async function MainApplication() {
    const store = useAppStore();
    store.setModal(LoadingModal);

    let server_status = await (await fetchWithCsrf("/api/status")).json();
    if (!(server_status.ssl_enabled)) {
        if (window.location.protocol !== "https") {
            store.addNotification(
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
        store.setModal(() => h(SuperAdminSetupInit));
    } else {
        const auth = await authCheck();
        if (!auth.success) {
            store.setModal(() => h(LoginInit, { motd: server_status.motd, version: server_status.version }));
        } else {
            store.setSuperadmin(auth.superadmin || false);
            await animationCooldown();
            store.closeModal();
            await renderApplication();
        }
    }
}

export async function authCheck() {
    const res = await fetchWithCsrf("/api/auth/verify", {
        method: "POST"
    });

    if (!res.ok) {
        const refreshRes = await fetchWithCsrf("/api/auth/refresh", {
            method: "POST"
        });
        if (!refreshRes.ok) {
            return { success: false };
        } else {
            console.log("Refreshed session.");
            const retryRes = await fetchWithCsrf("/api/auth/verify", {
                method: "POST"
            });
            if (!retryRes.ok) return { success: false };
            const data = await retryRes.json();
            return { success: true, superadmin: data.superadmin };
        }
    }
    const data = await res.json();
    return { success: true, superadmin: data.superadmin };
}

export async function renderApplication() {
    const store = useAppStore();
    const res = await (await fetchWithCsrf("/api/auth/get-user-data")).json();
    let server_status = await (await fetchWithCsrf("/api/status")).json();

    if (VaultSession.getKey() == null) {
        if (loadVaultKey() == null) {
            console.log("Vault key not found, redirecting to login.");
            await logout();
            return;
        }
    }

    try {
        await VaultSession.obtainVault();
    } catch (e) {
        console.error("Failed to obtain vault:", e);
        await logout();
        return;
    }

    // In Vue, we use the store to manage visibility and content
    // Zarium component will watch these or we can use a store for sidebar
    // For now, let's assume we have a sidebar store or similar
    // Or we can just let Zarium handle it itself upon mounting/showing
    
    // showZarium state in store could be used
    store.showZariumView();
    // In Vue, we can pass components or just data
    // Let's use components for now to keep it similar
    store.setGroups(Groups);
    store.setAccountbar(() => h(Accountbar, { id: res.id, username: res.username, displayname: res.displayname }));

    openWebsocket();
}

function openWebsocket() {
    const protocol = location.protocol === "https:" ? "wss" : "ws";
    ws! = new WebSocket(`${protocol}://${location.host}/api/session_ws`);

    ws!.onmessage = async (event) => {
        const store = useAppStore();
        const data = JSON.parse(event.data);
        if (data.type === "vault_update") {
            try {
                await VaultSession.obtainVault();
                store.addNotification({
                    title: "Vault Updated",
                    content: "Your vault has been updated from another session.",
                    type: "info"
                });
            } catch (e) {
                console.error("Failed to sync vault:", e);
            }
        }
    }
}