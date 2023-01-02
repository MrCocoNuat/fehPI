import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { LocalRepositoryReader, RemoteRepositoryReader, RepositoryReader } from "../../api-client/github/github";
import { MediaWikiReader } from "../../api-client/mediawiki/mediawiki";
import { RepositoryDetails, WikiDetails } from "./datasource-types";

const loadDataSourceDetails = (descriptor: string) => {
    const fileText = readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "remote-data.json"), "utf-8");
    const fileJson = JSON.parse(fileText) as { [repositoryDescriptor: string]: any };
    return fileJson[descriptor];
}

const fehRepositoryReader: () => RepositoryReader = () => {
    const repositoryDetails = loadDataSourceDetails("feh-assets-json") as RepositoryDetails;
    //in dev, use a local copy instead of around 100 graphql requests
    return (!!repositoryDetails.useLocal) ?
        new LocalRepositoryReader(repositoryDetails)
        : new RemoteRepositoryReader(repositoryDetails);
}

const mediaWikiReader: () => MediaWikiReader = () => {
    const mediaWikiDetails = loadDataSourceDetails("feh-wiki") as WikiDetails;
    return new MediaWikiReader(mediaWikiDetails);
}

export const fehAssetsJsonReader = fehRepositoryReader();
export const fehWikiReader = mediaWikiReader();