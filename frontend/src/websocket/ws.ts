export class Socket {
    private socket: WebSocket;
    private ready: boolean;
    private queue: string[];

    constructor() {
        this.socket = new WebSocket('ws://localhost:8080/ws');
        this.ready = false;
        this.queue = [];
        this.socket.onopen = () => {
            this.ready = true;
            this.queue.forEach((item) => {
                this.socket.send(item);
            });
        };

        this.socket.onclose = (e) => {
            this.ready = false;
            console.log('closed ws');
            console.log(e.reason);
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
