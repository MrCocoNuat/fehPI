import { Octokit } from "@octokit/core";
import { GraphQlQueryResponseData } from "@octokit/graphql";
import { GitBlobResponse, GitTreeResponse, GitObjectType } from "../types/git-types";
import { keyFor } from "./keys";

export class RepositoryReader{
    private octokit : Octokit;
    private GIT_BLOB_QUERY_FACTORY : (path: string) => string;
    private GIT_TREE_QUERY_FACTORY : (path: string) => string;
    
    constructor(repoOwner: string, repoName: string, branch: string){

        this.octokit = new Octokit({auth: keyFor("octokit")});

        console.error("CLIENT-SIDE VISIBLE? LEAK - OCTOKIT");
        
        this.GIT_BLOB_QUERY_FACTORY = (path) : string => `query repo {
            repository(owner: "${repoOwner}", name: "${repoName}") {
                object(expression: "${branch}:${path}") {
                    ... on Blob{
                        text
                        byteSize
                    }
                }
            }
        }` 
        
        this.GIT_TREE_QUERY_FACTORY = (path) : string => `query repo {
            repository(owner: "${repoOwner}", name: "${repoName}") {
                object(expression: "${branch}:${path}") {
                    ... on Tree {
                        entries{
                            name
                            type
                        }
                    }
                }
            }
        }` 
    }
    
    async queryForBlob(path : string) : GitBlobResponse {
        return await this.octokit.graphql(this.GIT_BLOB_QUERY_FACTORY(path)) as unknown as GitBlobResponse;
    }

    async queryForTree(path : string) : GraphQlQueryResponseData {
        return await this.octokit.graphql(this.GIT_TREE_QUERY_FACTORY(path)) as unknown as GitTreeResponse;
    }
}