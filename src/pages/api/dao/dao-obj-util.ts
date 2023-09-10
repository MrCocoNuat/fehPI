
// real useful for POSTing huge hashes to redis - break it up in case the endpoint does not like multi-MB requests
export function partitionObj<V>(obj: {[key : string | number]: V}, maxBatchSize: number) {
    const result = [] as (typeof obj)[];
    let counter = 0;
    let currentBatch = {} as typeof obj;
    for (const key in obj){
        currentBatch[key] = obj[key];
        counter++;
        if (counter == maxBatchSize){
            counter = 0;
            result.push(currentBatch);
            currentBatch = {} as typeof obj;
        }
    }
    if (counter != 0){ // don't forget the last batch!
        result.push(currentBatch);
    }
    return result;
}