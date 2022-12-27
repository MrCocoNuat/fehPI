import { Octokit } from "@octokit/core";
import { GraphQlQueryResponseData } from "@octokit/graphql";
import { request } from "https";
import path from "path";
import { GitBlobResponse, GitTreeResponse, GitObjectType } from "../types/git-types";
import { RepositoryDetails } from "../types/repository-types";
import { keyFor } from "./keys";
import fetch from "node-fetch";

export class RepositoryReader{
    private octokit : Octokit;
    private GIT_BLOB_QUERY_FACTORY : (targetPath: string) => string;
    private GIT_TREE_QUERY_FACTORY : (targetPath: string) => string;
    private RAW_URL_FACTORY: (targetPath: string) => string;
    
    constructor({repoOwner, repoName, branch, rawUrl} : RepositoryDetails){
        
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
        //console.log(this.GIT_BLOB_QUERY_FACTORY(tagertPath));
        return this.octokit.graphql(this.GIT_BLOB_QUERY_FACTORY(tagertPath)) as unknown as GitBlobResponse;
    }
    
    async queryForTree(targetPath : string) : Promise<GitTreeResponse> {
        //console.log(this.GIT_TREE_QUERY_FACTORY(targetPath));
        return this.octokit.graphql(this.GIT_TREE_QUERY_FACTORY(targetPath)) as unknown as GitTreeResponse;
    }
    
    // for when the graphQL api truncates the blob because it is longer than around 500kB
    async getRawBlob(targetPath: string) : Promise<string>{
        //console.log("GET", this.RAW_URL_FACTORY(targetPath));
        return fetch(this.RAW_URL_FACTORY(targetPath)).then(data => data.text()); 
    }
}