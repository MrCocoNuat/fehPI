import { Language, Message } from "./dao-types";
import { Dao } from "../mixins/dao";
import { GithubSourced } from "../mixins/github-sourced";
import { KeyIndexed } from "../mixins/key-indexed";

// typescript needs this to correctly infer the type parameters of generic mixins, 
// Thanks https://stackoverflow.com/a/57362442
const typeToken = null! as Message;

// There are 10 languages to support right now, each needs its own sub-DAO
class LangMessageDao extends GithubSourced(typeToken, KeyIndexed(typeToken, Dao<string>)){
    RELEVANT_KEY_PATTERNS = [
        /^MSID_.*/, // Messages related to Skills
        /^MPID_.*/, // Messages related to Heroes (Persons)
    ] as const;

    constructor({repoPath, timerLabel} : {repoPath: string, timerLabel: string}){
        super({repoPath, timerLabel});
    }
    
    // already correct format
    protected override toValueType: (json: any) => Message = (json) => (json);
    
    protected override valueTypeConsumer: (message: Message) => void = (message) => {
        if (this.RELEVANT_KEY_PATTERNS.some(regExp => regExp.test(message.key))) this.setByKey(message.key, message);
    };

    async getByMessageKeys(messageKeys : string[]){
        await this.initialization;
        return this.getByKeys(messageKeys);
    }
}

export class MessageDao{
    
    private langMessageDaos : {[lang in Language] : LangMessageDao} = {
        0: new LangMessageDao({repoPath: "files/assets/EUDE/Message/", timerLabel: "TIME: EUDE Message DAO finished initialization"}),
        1: new LangMessageDao({repoPath: "files/assets/EUEN/Message/", timerLabel: "TIME: EUEN Message DAO finished initialization"}),
        2: new LangMessageDao({repoPath: "files/assets/EUES/Message/", timerLabel: "TIME: EUES Message DAO finished initialization"}),
        3: new LangMessageDao({repoPath: "files/assets/EUFR/Message/", timerLabel: "TIME: EUFR Message DAO finished initialization"}),
        4: new LangMessageDao({repoPath: "files/assets/EUIT/Message/", timerLabel: "TIME: EUIT Message DAO finished initialization"}),
        5: new LangMessageDao({repoPath: "files/assets/JPJA/Message/", timerLabel: "TIME: JPJA Message DAO finished initialization"}),
        6: new LangMessageDao({repoPath: "files/assets/TWZH/Message/", timerLabel: "TIME: TWZH Message DAO finished initialization"}),
        7: new LangMessageDao({repoPath: "files/assets/USEN/Message/", timerLabel: "TIME: USEN Message DAO finished initialization"}),
        8: new LangMessageDao({repoPath: "files/assets/USES/Message/", timerLabel: "TIME: USES Message DAO finished initialization"}),
        9: new LangMessageDao({repoPath: "files/assets/USPT/Message/", timerLabel: "TIME: USPT Message DAO finished initialization"}),
    }
    
    async getByMessageKeys(lang: Language, messageKeys: string[]){
        const langMessageDao = this.langMessageDaos[lang];
        return langMessageDao.getByMessageKeys(messageKeys);
    }
}