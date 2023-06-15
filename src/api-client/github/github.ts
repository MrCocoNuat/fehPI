import { Octokit } from "@octokit/core";
import path from "path";
import { GitBlobResponse, GitTreeResponse } from "./git-types";
import { RepositoryDetails } from "../../pages/api/dao/remote-data/datasource-types";
import { keyFor } from "../keys";
import fetch from "node-fetch";
import { access, constants, readdir, readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { readFileSync, readdirSync } from "fs";

export interface RepositoryReader {
    queryForBlob: (targetPath: string) => Promise<GitBlobResponse>;
    queryForTree: (targetPath: string) => Promise<GitTreeResponse>;
    getRawBlob: (targetPath: string) => Promise<string>;
}

export class RemoteRepositoryReader implements RepositoryReader {
    private octokit: Octokit;
    private GIT_BLOB_QUERY_FACTORY: (targetPath: string) => string;
    private GIT_TREE_QUERY_FACTORY: (targetPath: string) => string;
    private RAW_URL_FACTORY: (targetPath: string) => string;

    constructor({ repoOwner, repoName, branch, rawUrl }: RepositoryDetails) {

        this.octokit = new Octokit({ auth: keyFor("octokit") });

        console.error("SENTINEL - client side means leak: OCTOKIT");

        this.GIT_BLOB_QUERY_FACTORY = (targetPath): string => `query repo {
            repository(owner: "${repoOwner}", name: "${repoName}") {
                object(expression: "${branch}:${targetPath}") {
                    ... on Blob{
                        text
                        isTruncated
                    }
                }
            }
        }`

        this.GIT_TREE_QUERY_FACTORY = (targetPath): string => `query repo {
            repository(owner: "${repoOwner}", name: "${repoName}") {
                object(expression: "${branch}:${targetPath}") {
                    ... on Tree {
                        entries{
                            name
                            type
                            object {
                                ... on Blob {
                                    isTruncated
                                }
                            }
                        }
                    }
                }
            }
        }`

        this.RAW_URL_FACTORY = (targetPath: string): string => path.join(rawUrl, branch, targetPath);
    }

    async queryForBlob(tagertPath: string): Promise<GitBlobResponse> {
        //console.log(this.GIT_BLOB_QUERY_FACTORY(tagertPath));
        return this.octokit.graphql(this.GIT_BLOB_QUERY_FACTORY(tagertPath)) as unknown as GitBlobResponse;
    }

    async queryForTree(targetPath: string): Promise<GitTreeResponse> {
        //console.log(this.GIT_TREE_QUERY_FACTORY(targetPath));
        return this.octokit.graphql(this.GIT_TREE_QUERY_FACTORY(targetPath)) as unknown as GitTreeResponse;
    }

    // for when the graphQL api truncates the blob because it is longer than around 500kB
    async getRawBlob(targetPath: string): Promise<string> {
        //console.log("GET", this.RAW_URL_FACTORY(targetPath));
        return fetch(this.RAW_URL_FACTORY(targetPath)).then(data => data.text());
    }
}


// dummy checks
// https://github.com/vercel/next.js/discussions/32236#discussioncomment-3029649
// Vercel's build process traces file dependencies through fs method calls,
// thus the subtrees needed must appear here or it won't be deployed too
// that would be bad
// must be a string literal too >:(
readdirSync(path.join(process.cwd(), "api-client/github/local-clone/feh-assets-json/files/assets/Common/SRPG/Skill"));
readdirSync(path.join(process.cwd(), "api-client/github/local-clone/feh-assets-json/files/assets/Common/SRPG/Person"));
readFileSync(path.join(process.cwd(), "api-client/github/local-clone/feh-assets-json/files/assets/Common/SRPG/Grow.json"));
readdirSync(path.join(process.cwd(), "api-client/github/local-clone/feh-assets-json/files/assets/EUDE/Message/"));
readdirSync(path.join(process.cwd(), "api-client/github/local-clone/feh-assets-json/files/assets/EUEN/Message/"));
readdirSync(path.join(process.cwd(), "api-client/github/local-clone/feh-assets-json/files/assets/EUES/Message/"));
readdirSync(path.join(process.cwd(), "api-client/github/local-clone/feh-assets-json/files/assets/EUFR/Message/"));
readdirSync(path.join(process.cwd(), "api-client/github/local-clone/feh-assets-json/files/assets/EUIT/Message/"));
readdirSync(path.join(process.cwd(), "api-client/github/local-clone/feh-assets-json/files/assets/JPJA/Message/"));
readdirSync(path.join(process.cwd(), "api-client/github/local-clone/feh-assets-json/files/assets/TWZH/Message/"));
readdirSync(path.join(process.cwd(), "api-client/github/local-clone/feh-assets-json/files/assets/USEN/Message/"));
readdirSync(path.join(process.cwd(), "api-client/github/local-clone/feh-assets-json/files/assets/USES/Message/"));
readdirSync(path.join(process.cwd(), "api-client/github/local-clone/feh-assets-json/files/assets/USPT/Message/"));

export class LocalRepositoryReader implements RepositoryReader {
    // and specifically here do NOT use statically analyzable
    // string literals, otherwise too much gets deployed and you hit size limits (ughhhh)
    // so this ridiculous concealment is necessary
    private readonly parts = [process.cwd(), "api-client/github/local-clone/"];
    private readonly LOCAL_ROOT = path.join(...this.parts);
    private LOCAL_REPO: string;

    constructor({ repoOwner, repoName, branch }: RepositoryDetails) {
        // verify that the local clone actually exists
        this.LOCAL_REPO = path.join(this.LOCAL_ROOT, repoName);

        access(this.LOCAL_REPO, constants.F_OK)
            .then(() => console.log(`Using LOCAL subtree ${repoOwner}/${repoName}, branch ${branch}`))
            .catch(err => {
                throw new Error(`Could not access local clone of repository ${repoOwner}/${repoName}. Does it exist?
            Try navigating to ${this.LOCAL_ROOT} and running the command:
            git clone https://github.com/${repoOwner}/${repoName} -b ${branch}.
            If this is a remote deployment: check process.cwd() == ${process.cwd()}, contents ${readdirSync(process.cwd())},`,
                    { cause: err })
            });
    }

    async queryForBlob(targetPath: string): Promise<GitBlobResponse> {
        return readFile(path.join(this.LOCAL_REPO, targetPath), "utf-8")
            .then(fileText => ({
                repository: {
                    object: {
                        text: fileText,
                        isTruncated: false
                    }
                }
            }));
    }
    async queryForTree(targetPath: string): Promise<GitTreeResponse> {
        return readdir(path.join(this.LOCAL_REPO, targetPath), { withFileTypes: true })
            .then(dirEntries => ({
                repository: {
                    object: {
                        entries: dirEntries.map((dirEntry) => ({
                            name: dirEntry.name,
                            type: (dirEntry.isFile()) ? "blob" : "tree",
                            object: {
                                isTruncated: false
                            }
                        })),
                    }
                }
            }));
    }
    async getRawBlob(targetPath: string) {
        return (await this.queryForBlob(targetPath)).repository.object.text;
    };
}