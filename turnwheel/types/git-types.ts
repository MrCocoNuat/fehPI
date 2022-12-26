export type GitObjectType = "tree" | "blob";

export type GitBlobResponse = Promise<{
    repository: {
        object: {
            text: string;
            byteSize: number;
        };
    };
}>

export type GitTreeResponse = Promise<{
    repository: {
        object: {
            entries: [
                {
                    name: string;
                    type: GitObjectType;
                }
            ];
        };
    };
}>
