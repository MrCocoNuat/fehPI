import styles from "../styles/layout.module.css";

// Utility to use CSS modules - pretty much global scope so kinda goes against its purpose, but ehhh

export function classes(...className : string[]){
    return className.map(className => styles[className]).join(" ");
}