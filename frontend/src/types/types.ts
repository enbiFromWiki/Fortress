export type WSResponse = {
    user: {
        username: string;
        userid: number;
        istemp: boolean;
        editcount: number;
        usergroups: string[];
        userage: string;
    };
    type?: string;
    title: string;
    diffhtml: string;
    newid: number;
    oldid: number;
    wiki: string;
    domain: string;
    diffsize: number;
    parsedcomment: string;
    currentRevision: boolean;
    history: HistEdit[];
    page?: string;
    revid?: number;
};

export type HistEdit = {
    revid: number;
    parentid: number;
    minor: boolean;
    user: string;
    timestamp: string | number;
    parsedcomment: string;
    tags: string[];
    temp: boolean;
    commenthidden: boolean;
    suppressed: boolean;
    sameuser?: boolean;
};
