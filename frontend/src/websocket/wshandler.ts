import { useEditStore } from '../stores/editstore';
import { socket } from './websocket';

export function startWs() {
    console.log('websocket starting');
    socket.subscribe((e: MessageEvent) => {
        const addToStore = useEditStore.getState().addEdit;
        const data = JSON.parse(e.data);
        if (data.type === 'notcurrentpage') {
            const changeCurrentRevs = useEditStore.getState().setOldRevisions;
            changeCurrentRevs({
                title: data.page,
                wiki: data.wiki,
            });
            console.log(data);
            return;
        }
        addToStore({ ...data, currentRevision: true });
    });
}
