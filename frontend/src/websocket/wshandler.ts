import { useEditStore } from '../stores/editstore';
import { socket } from './websocket';

export function startWs() {
    console.log('websocket starting');
    socket.subscribe((e: MessageEvent) => {
        const addToStore = useEditStore.getState().addEdit;
        console.log(JSON.parse(e.data));
        addToStore(JSON.parse(e.data));
    });
}
