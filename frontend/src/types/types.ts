export type WSResponse = {
    user: {
        username: string;
        userid: number;
        istemp: boolean;
        editcount: number;
        usergroups: string[];
        userage: string;
    };
    title: string;
    diffhtml: string;
    newid: number;
    oldid: number;
    wiki: string;
    domain: string;
    diffsize: number;
    parsedcomment: string;
};
