import { useAuthStore } from '../stores/authstore';

export class Socket {
    private socket?: WebSocket;
    private ready = false;
    private queue: string[] = [];

    private reconnectAttempts = 0;
    private reconnectTimeout?: number;
    private manuallyClosed = false;
    private listeners: ((e: MessageEvent) => void)[] = [];

    private readonly url =
        'ws://localhost:8080/ws?maxcount=99999&wikis=test2wiki,testwiki,enwiki';

    private setConnected: (i: boolean) => void;

    constructor() {
        this.setConnected = useAuthStore.getState().setConnected;
        this.connect();
    }

    private connect() {
        this.socket = new WebSocket(this.url);

        this.socket.onopen = () => {
            console.log('Connected');

            this.ready = true;
            this.reconnectAttempts = 0;
            this.setConnected(true);

            while (this.queue.length > 0) {
                const msg = this.queue.shift();
                if (msg) {
                    this.socket?.send(msg);
                }
            }
        };

        this.socket.onmessage = (e) => {
            this.listeners.forEach((fn) => fn(e));
        };

        this.socket.onerror = (err) => {
            console.error(err);
        };

        this.socket.onclose = (event) => {
            console.log('Disconnected', event.reason);

            this.ready = false;
            this.setConnected(false);

            if (!this.manuallyClosed) {
                this.scheduleReconnect();
            }
        };
    }

    private scheduleReconnect() {
        this.reconnectAttempts++;

        const delay = Math.min(
            1000 * Math.pow(2, this.reconnectAttempts - 1),
            30000
        );

        console.log(`Reconnecting in ${delay}ms`);

        this.reconnectTimeout = window.setTimeout(() => {
            this.connect();
        }, delay);
    }

    subscribe(fn: (event: MessageEvent) => void) {
        this.listeners.push(fn);
    }

    send(data: string) {
        if (
            this.ready &&
            this.socket &&
            this.socket.readyState === WebSocket.OPEN
        ) {
            this.socket.send(data);
        } else {
            this.queue.push(data);
        }
    }

    close() {
        this.manuallyClosed = true;

        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }

        this.socket?.close();
    }
}
