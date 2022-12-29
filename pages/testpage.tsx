import { GetStaticProps } from "next";

export default function TestComponent(props: {user: any}){
    return <>
    <div>static props: {props.user}</div>
    <div>Check console for "SENTINEL" strings, leaking server-side information</div>
    </>
}

export const getStaticProps : GetStaticProps = async () => {
    return {props: {user: "dummy"}};
}
