import { GetStaticProps } from "next";
import { RepositoryReader } from "../api-client/github";
import skillDao from "../dao/skill-dao";

export default function Test(props: {user: any}){
    return <>
        <div>Octokit is authenticated as ordinary user with username: {props.user}</div>
    </>
}

export const getStaticProps : GetStaticProps = async () => {
    const octokitResponse = {viewer: {login: "dummy"}};

    const readmeText = "dummy me";


    console.log ("should be undefined:", await skillDao.getSkillByIdNum(111));

    return {
        props: {
            user: readmeText
        }
    }

}
