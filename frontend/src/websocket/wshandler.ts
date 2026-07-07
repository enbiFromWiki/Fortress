import { useEditStore } from '../stores/editstore';
import { usePageStore } from '../stores/pagestore';
import type { WSResponse } from '../types/types';
import { socket } from './websocket';

export function startWs() {
    console.log('websocket starting');
    socket.subscribe((e: MessageEvent) => {
        const addToEditStore = useEditStore.getState().addEdit;
        const addToPageStore = usePageStore.getState().setPage;

        const data: WSResponse = JSON.parse(e.data);
        if (data.type === 'notcurrentpage') {
            const changeCurrentRevs = useEditStore.getState().setOldRevisions;
            changeCurrentRevs({
                title: data.page!,
                wiki: data.wiki,
            });
            console.log(data);
            return;
        }
        console.log(data);
        addToEditStore({ ...data, currentRevision: true, history: [] });
        addToPageStore(data.title, data.wiki, { history: data.history });
    });
}
