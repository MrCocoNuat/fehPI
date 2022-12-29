import { GetStaticProps } from "next";
import { heroDao, messageDao, skillDao } from "../dao/dao-registry";
import { Language } from "../types/dao-types";


export default function Test(props: {user: any}){
    return <>
    <div>static props: {props.user}</div>
    <div>Check console for "SENTINEL" strings, leaking server-side information</div>
    </>
}

export const getStaticProps : GetStaticProps = async () => {
    const octokitResponse = {viewer: {login: "dummy"}};
    
    const readmeText = "dummy me";
    
    
    console.log("skill 595 is Geirskogul:", (await skillDao.getByIdNums([595]))[0].idTag);
    console.log("skill with some idTag is also Geirskogul:", (await skillDao.getByIdTags(['SID_ゲイルスケグル']))[0].idTag);
    console.log("hero 168 is Lucina: Brave Princess:", (await heroDao.getByIdNums([168]))[0].idTag);
    console.log("Asura Blades in USEN, EUFR, JPJA:", 
    [
        (await messageDao.getByMessageKeys(Language.USEN, ['MSID_アスラの双刃']))[0].value,
        (await messageDao.getByMessageKeys(Language.EUFR, ['MSID_アスラの双刃']))[0].value,
        (await messageDao.getByMessageKeys(Language.JPJA, ['MSID_アスラの双刃']))[0].value,
    ]
    );
    
    return {
        props: {
            user: readmeText
        }
    }
    
}
