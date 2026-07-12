import { useEditStore } from '../stores/editstore';
import { usePageStore } from '../stores/pagestore';
import type { WSResponse, RevChange, HistEdit } from '../types/types';
import { locallyParseEditSummary } from '../util/util';
import { socket } from './websocket';

export function startWs() {
    console.log('websocket starting');
    socket.subscribe((e: MessageEvent) => {
        const addToEditStore = useEditStore.getState().addEdit;
        const addToPageStore = usePageStore.getState().setPage;
        const addToHist = usePageStore.getState().addToHist;

        let data: WSResponse | RevChange = JSON.parse(e.data);
        console.log(data);
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
                console.log(data);
                break;
            }
            case 'new': {
                data = data as WSResponse;
                addToEditStore({ ...data, currentRevision: true, history: [] });
                addToPageStore(data.title, data.wiki, {
                    history: data.history,
                });
                break;
            }
        }
    });
}
