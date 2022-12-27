import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { RepositoryReader } from "../api-client/github";
import { RepositoryDetails } from "../types/repository-types";

const loadRepositoryDetails = (descriptor : string) => {
    const fileText = readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "remote-repository.json"), "utf-8");
    const fileJson = JSON.parse(fileText) as {[repositoryDescriptor: string] : RepositoryDetails};
    return fileJson[descriptor];
}

const fehRepositoryReader = () => {
    return new RepositoryReader(loadRepositoryDetails("feh-assets-json"));
}

export const fehAssetsJsonReader = fehRepositoryReader();