import path from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

// one-time so it is not that bad to synchronously read like 100B of api keys
const loadKeys = () => {
    try {
        const keysString = readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "keys.json"), "utf-8");
        return JSON.parse(keysString) as { [api: string]: string };
    }
    catch (error){
        // the keys.json file does not exist, we probably don't need it
        console.warn("keys.json does not exist!");
        return {};
    }
}

function keyForGenerator() {
    console.error("SENTINEL - client side means leak: API KEYS");
    const keysForApis = loadKeys();
    return (apiName: string) => keysForApis[apiName];
}

export const keyFor = keyForGenerator();