import { Octokit } from "@octokit/core";
import path from "path";
import { GitBlobResponse, GitTreeResponse } from "./git-types";
import { RepositoryDetails } from "../../pages/api/dao/remote-data/datasource-types";
import { keyFor } from "../keys";
import fetch from "node-fetch";
import { access, constants, readdir, readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { isUint16Array } from "util/types";

export interface RepositoryReader {
    queryForBlob : (targetPath : string) => Promise<GitBlobResponse>;
    queryForTree : (targetPath : string) => Promise<GitTreeResponse>;
    getRawBlob : (targetPath : string) => Promise<string>;
}

export class RemoteRepositoryReader implements RepositoryReader{
    private octokit : Octokit;
    private GIT_BLOB_QUERY_FACTORY : (targetPath: string) => string;
    private GIT_TREE_QUERY_FACTORY : (targetPath: string) => string;
    private RAW_URL_FACTORY: (targetPath: string) => string;
    private isAuthed: boolean;
    
    constructor({repoOwner, repoName, branch, rawUrl} : RepositoryDetails){
        
        this.isAuthed = keyFor("octokit") != undefined;

        this.octokit = new Octokit({auth: keyFor("octokit")});
        
        console.error("SENTINEL - client side means leak: OCTOKIT");
        
        this.GIT_BLOB_QUERY_FACTORY = (targetPath) : string => `query repo {
            repository(owner: "${repoOwner}", name: "${repoName}") {
                object(expression: "${branch}:${targetPath}") {
                    ... on Blob{
                        text
                        isTruncated
                    }
                }
            }
        }` 
        
        this.GIT_TREE_QUERY_FACTORY = (targetPath) : string => `query repo {
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
        
        this.RAW_URL_FACTORY = (targetPath : string) : string => path.join(rawUrl, branch, targetPath);
    }
    
    async queryForBlob(tagertPath : string) : Promise<GitBlobResponse> {
        if (!this.isAuthed){
            console.warn("Github - no auth");
            return undefined as any;
        }
        //console.log(this.GIT_BLOB_QUERY_FACTORY(tagertPath));
        return this.octokit.graphql(this.GIT_BLOB_QUERY_FACTORY(tagertPath)) as unknown as GitBlobResponse;
    }
    
    async queryForTree(targetPath : string) : Promise<GitTreeResponse> {
        if (!this.isAuthed){
            console.warn("Github - no auth");
            return undefined as any;
        }
        //console.log(this.GIT_TREE_QUERY_FACTORY(targetPath));
        return this.octokit.graphql(this.GIT_TREE_QUERY_FACTORY(targetPath)) as unknown as GitTreeResponse;
    }
    
    // for when the graphQL api truncates the blob because it is longer than around 500kB
    async getRawBlob(targetPath: string) : Promise<string>{
        if (!this.isAuthed){
            console.warn("Github - no auth");
            return undefined as any;
        }
        //console.log("GET", this.RAW_URL_FACTORY(targetPath));
        return fetch(this.RAW_URL_FACTORY(targetPath)).then(data => data.text()); 
    }
}

export class LocalRepositoryReader implements RepositoryReader {
    private readonly LOCAL_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "local-clone"); 
    private LOCAL_REPO : string;
    
    constructor({repoOwner, repoName, branch} : RepositoryDetails) {
        // verify that the local clone actually exists
        this.LOCAL_REPO = path.join(this.LOCAL_ROOT, repoName);
        
        access(this.LOCAL_REPO, constants.F_OK)
        .then(() => console.log(`Using LOCAL subtree ${repoOwner}/${repoName}, branch ${branch}`))
        .catch(err => {
            throw new Error(`Could not access local clone of repository ${repoOwner}/${repoName}. Does it exist?
            Try navigating to ${this.LOCAL_ROOT} and running the command:
            git clone https://github.com/${repoOwner}/${repoName} -b ${branch}`)
        });
    }
    
    async queryForBlob(targetPath: string) : Promise<GitBlobResponse>{
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
    async queryForTree(targetPath: string) : Promise<GitTreeResponse>{
        return readdir(path.join(this.LOCAL_REPO, targetPath), {withFileTypes: true})
        .then(dirEntries => ({
            repository: {
                object: {
                    entries: dirEntries.map((dirEntry) => ({
                        name: dirEntry.name,
                        type: (dirEntry.isFile())? "blob" : "tree",
                        object: {
                            isTruncated: false
                        }
                    })),
                }
            }
        }));
    }
    async getRawBlob (targetPath: string) {
        return (await this.queryForBlob(targetPath)).repository.object.text;
    };
}