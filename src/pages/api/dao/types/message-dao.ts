import { Language, Message } from "./dao-types";
import { Dao } from "../mixins/dao";
import { GithubSourced } from "../mixins/github-sourced";
import { WriteOnceKeyIndexed } from "../mixins/key-indexed";
import { VercelKvBacked } from "../mixins/vercel-kv-backed";

// typescript needs this to correctly infer the type parameters of generic mixins, 
// Thanks https://stackoverflow.com/a/57362442
const typeToken = null! as Message;

const keyTypeToken = "";

// There are 10 languages to support right now, each needs its own sub-DAO
class LangMessageDao extends VercelKvBacked(typeToken, GithubSourced(typeToken, WriteOnceKeyIndexed(typeToken, Dao<string>))){
    RELEVANT_KEY_PATTERNS = [
        /^MSID_.*/, // Messages related to Skills
        /^MPID_.*/, // Messages related to Heroes (Persons)
    ] as const;
    initialization: Promise<void>;

    constructor({repoPath, timerLabel} : {repoPath: string, timerLabel: string}){
        super({repoPath});
        console.time(timerLabel);
        // this step is for the admin runner - writes to KV        
        this.initialization = this.loadData().then(async () => await this.writeHash("MESSAGE_BY_KEY_" + repoPath, this.collectionKeys).then(() => console.timeEnd(timerLabel)));
        this.initialization = this.getData().then(() => console.timeEnd(timerLabel));
    }
    
    private async getData() {
        this.setByKeys(Object.values(await this.readHash("MESSAGE_BY_KEY", keyTypeToken))); //TODO: use the damn setter ya bum
    }

    private async loadData(){ // to KV
        return this.getGithubData()
        .then(data => data.filter(message => this.RELEVANT_KEY_PATTERNS.some(regExp => regExp.test(message.idTag))))
        .then(data => this.setByKeys(data));
    }
    
    // already correct format
    protected override toValueType = (json : any) => {
        return {
            idTag: json.key,
            value: json.value,
        }
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