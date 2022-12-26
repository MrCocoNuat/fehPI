import { GetStaticProps } from "next";
import { octokitTest } from "../api-client/octokit";
export default function Test(props: {user: any}){
    
    return <>
        <div>Octokit is authenticated as ordinary user with username: {props.user.login}</div>
    </>
}

export const getStaticProps : GetStaticProps = async () => {
    const octokitResponse = await octokitTest();
    console.log(JSON.stringify(octokitResponse));
    return {
        props: {
            user: octokitResponse.viewer
        }
    }
}
