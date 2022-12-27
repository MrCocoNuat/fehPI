import { GetStaticProps } from "next";
import { heroDao, skillDao } from "../dao/dao-registry";


export default function Test(props: {user: any}){
    return <>
        <div>static props: {props.user}</div>
        <div>No leaking of server-side information</div>
    </>
}

export const getStaticProps : GetStaticProps = async () => {
    const octokitResponse = {viewer: {login: "dummy"}};

    const readmeText = "dummy me";


    console.log("skill 595 is Geirskogul:", await skillDao.getByIdNum(595));
    console.log("hero 168 is Lucina: Brave Princess", await heroDao.getByIdNum(168));

    return {
        props: {
            user: readmeText
        }
    }

}
