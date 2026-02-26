import * as Electron from "electron";
import {run} from "./desktop_client/client";

const args = process.argv.slice(2);

run(...args).catch(async (e) => {
    console.error("[ CRASHED ]\n"+e);
    Electron.dialog.showErrorBox("Client crashed", e.message);
    process.exit(1);
})