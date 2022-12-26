import { GetStaticProps } from "next";
import { RepositoryReader } from "../api-client/github";

export default function Test(props: {user: any}){
    return <>
        <div>Octokit is authenticated as ordinary user with username: {props.user}</div>
    </>
}

export const getStaticProps : GetStaticProps = async () => {
    const octokitResponse = {viewer: {login: "dummy"}};

    const r = new RepositoryReader("HertzDevil", "feh-assets-json", "book7");
    const readme = await r.queryForBlob("README.md");
    
    const readmeText = readme.repository.object.text;
    return {
        props: {
            user: readmeText
        }
    }
}
