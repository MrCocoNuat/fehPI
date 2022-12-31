import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { LocalRepositoryReader, RemoteRepositoryReader, RepositoryReader } from "../../api-client/github/github";
import { RepositoryDetails } from "./repository-types";



const loadRepositoryDetails = (descriptor : string) => {
    const fileText = readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "remote-repository.json"), "utf-8");
    const fileJson = JSON.parse(fileText) as {[repositoryDescriptor: string] : RepositoryDetails};
    return fileJson[descriptor];
}

const fehRepositoryReader : () => RepositoryReader = () => {
    const repositoryDetails = loadRepositoryDetails("feh-assets-json");
    //TEMP- always use local
    return (process.env.NODE_ENV == "development" || process.env.NODE_ENV == "production" || process.env.NODE_ENV == "test")? 
    new LocalRepositoryReader(repositoryDetails)
    : new RemoteRepositoryReader(repositoryDetails);
}

export const fehAssetsJsonReader = fehRepositoryReader();