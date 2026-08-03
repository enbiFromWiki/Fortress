import { useEditStore } from '../stores/editstore';
import { usePageStore } from '../stores/pagestore';
import { useUserStore } from '../stores/userstore';
import type {
    RecentChange,
    RevChange,
    HistEdit,
    BlockResponse,
} from '../types/types';
import { locallyParseEditSummary } from '../util/util';
import { socket } from './websocket';

export function startWs() {
    console.log('websocket starting');
    socket.connect();
    socket.subscribe((e: MessageEvent) => {
        const addToEditStore = useEditStore.getState().addEdit;
        const addToPageStore = usePageStore.getState().patchPage;
        const addToHist = usePageStore.getState().addToHist;
        const patchUser = useUserStore.getState().patchUser;

        let data: RecentChange | RevChange | BlockResponse = JSON.parse(e.data);
        switch (data.type) {
            case 'revchange': {
                data = data as RevChange;
                const changeCurrentRevs =
                    useEditStore.getState().setOldRevisions;
                changeCurrentRevs({
                    title: data.page,
                    wiki: data.wiki,
                });
                const historyAddition: HistEdit = {
                    revid: data.revid,
                    parentid: 0,
                    minor: false,
                    user: data.user,
                    timestamp: 0,
                    parsedcomment: locallyParseEditSummary(
                        data.comment,
                        data.domain
                    ),
                    tags: [],
                    temp: /^~2/.test(data.user),
                    commenthidden: false,
                    suppressed: false,
                };
                addToHist(data.page, data.wiki, historyAddition);
                break;
            }
            case 'create':
                console.log(data);
                data = data as RecentChange;
                addToEditStore({ ...data, currentRevision: true, history: [] });
                addToPageStore(data.title, data.wiki, {
                    history: data.history,
                });
                if (data.level !== undefined) {
                    patchUser(data.user.username, { level: data.level });
                }
                console.log(
                    usePageStore.getState().pages[`${data.title}|${data.wiki}`]
                );
                break;
            case 'new': {
                data = data as RecentChange;
                addToEditStore({ ...data, currentRevision: true, history: [] });
                addToPageStore(data.title, data.wiki, {
                    history: data.history,
                });
                if (data.level !== undefined) {
                    patchUser(data.user.username, { level: data.level });
                }
                break;
            }
            case 'block': {
                data = data as BlockResponse;
                console.log('BLOCK:', data);
                patchUser(data.user as string, {
                    blocked: new Set([data.wiki]),
                });
            }
        }
    });
}
