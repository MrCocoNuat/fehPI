import { Octokit } from "@octokit/core";
import { GraphQlQueryResponseData } from "@octokit/graphql";
import { keyFor } from "./keys";

const octokit = new Octokit({auth: keyFor("octokit")});

export const octokitTest : () => GraphQlQueryResponseData = async () => {
    return await octokit.graphql(`query { 
        viewer { 
            login
        }
    }`
    )
}
