import {run} from "./server/server";

const args = process.argv.slice(2);

run(...args).catch(async (e) => {
    console.error("[ CRASHED ]\n"+e);
    process.exit(1);
})