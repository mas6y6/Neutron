import { run } from "./server/server";

const args = process.argv.slice(2);

run(...args).catch(async (e: unknown) => {
    if (e instanceof Error) {
        console.error("[ CRASHED ]\n" + e.stack);
    } else {
        console.error("[ CRASHED ]\n", e);
    }
    process.exit(1);
});