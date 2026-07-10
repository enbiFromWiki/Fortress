import { useAuthStore } from '../stores/authstore';

export class Socket {
    private socket: WebSocket;
    private ready: boolean;
    private queue: string[];
    private setConnected: (i: boolean) => void;

    constructor() {
        this.setConnected = useAuthStore.getState().setConnected;
        this.socket = new WebSocket(
            'ws://localhost:8080/ws?maxcount=99999&wikis=testwiki'
        );
        this.ready = false;
        this.queue = [];
        this.socket.onopen = () => {
            this.setConnected(true);
            this.ready = true;
            this.queue.forEach((item) => {
                this.socket.send(item);
            });
        };

        this.socket.onclose = (e) => {
            this.setConnected(false);
            this.ready = false;
            console.log('closed ws');
            console.log(e.reason);
        };
        this.socket.onerror = (e) => {
            console.error(e);
            this.setConnected(false);
        };
    }

    subscribe(fn: (i: MessageEvent) => void) {
        this.socket.addEventListener('message', fn);
    }

    send(data: string) {
        if (!this.ready) {
            this.queue.push(data);
        } else {
            this.socket.send(data);
        }
    }
}
