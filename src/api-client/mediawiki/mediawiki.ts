import { WikiDetails } from "../../dao/remote-data/datasource-types";
import { asciify, TITLE_SEPARATOR } from "./file-title";


type MediaWikiResponse = {
    query: {
        pages: {
            [pageId: number]: {
                title: string,
                imageinfo: {
                    url: string
                }[]
            }
        }
    }
}

export class MediaWikiReader {
    private IMAGE_URL_QUERY_FACTORY: (upToFiftyTitles: string[]) => string;

    constructor({ baseUrl }: WikiDetails) {
        // mediawiki allows 50 requests in one batch, so do that!

        this.IMAGE_URL_QUERY_FACTORY = (upToFiftyTitles: string[]) => {
            if (upToFiftyTitles.length > 50) {
                throw new Error(`mediawiki max batch size is 50, received ${upToFiftyTitles.length}.`);
            }
            const params = new URLSearchParams({
                action: "query",
                prop: "imageinfo",
                iiprop: "url",
                titles: upToFiftyTitles.join(TITLE_SEPARATOR),
                format: "json",
            })
            return `${baseUrl}?${params.toString()}`;
        }
    }

    // return results ordered!
    async queryImageUrls(fileTitles: string[]) {

        // batch up
        const batchSize = 50;
        const batches: string[][] = [];
        for (let i = 0; i < fileTitles.length; i += batchSize) {
            batches.push(fileTitles.slice(i, i + batchSize));
        }

        // collect results in:
        const imageUrlsByFileTitles: { [fileTitle: string]: string } = {};
        // each goes through
        // MUST REMEMBER - forEach does not support async/await !!
        for (const batch of batches) {
            const batchJson= await fetch(this.IMAGE_URL_QUERY_FACTORY(batch)).then(data => data.json()) as MediaWikiResponse;
            // associate the resulting urls with their file title for later retrieval
            Object.values(batchJson.query.pages).forEach(({ title, imageinfo }) => {
                // !!! The title property is returned with spaces, not underscores!
                if (imageinfo === undefined){
                    //uh oh
                    console.error(`MediaWiki returned missing for title ${title}`);
                    return;   
                }
                // remove query parameters (what the heck is cb?)
                // yeah you could just regex this but that is harder to immediately understand...
                const url = new URL(imageinfo[0].url);
                url.search = "";
                imageUrlsByFileTitles[title] = url.toString();
            });
        }
        // return results in the order requested
        const imageUrls = fileTitles.map(fileTitle => imageUrlsByFileTitles[fileTitle]);
        return imageUrls;
    }

}