export type RecentChange = {
    user: {
        username: string;
        userid: number;
        istemp: boolean;
        editcount: number;
        usergroups: string[];
        userage: string;
    };
    type?: 'new' | 'create';
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
    watched: boolean;
    oldsize: number;
    newsize: number;
    diffid: number;
    pagewatched: boolean;
    level?: number;
};

export type BlockResponse = {
    type: 'block';
    wiki: string;
    user: string;
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

export type RevChange = {
    type: 'revchange';
    page: string;
    wiki: string;
    comment: string;
    user: string;
    revid: number;
    domain: string;
};

export type Filter = {
    editcount: number;
    wikis: string[];
};
