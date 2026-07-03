import { socket } from './websocket';

export function startWs() {
    socket.subscribe((e: MessageEvent) => {
        console.log(JSON.parse(e.data));
    });
}
