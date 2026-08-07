import { socket } from '../websocket';
import type { WSEditRes, WSQueryRes } from './toast';

const pending = new Map();

socket.subscribe((e) => {
    const ms = JSON.parse(e.data);
    if (ms.type !== 'response') return;
    console.log(ms);
    const req = pending.get(ms.id);
    if (!req) return;
    pending.delete(ms.id);
    if (ms.status === 'success') {
        req.resolve(ms);
    } else {
        req.reject(ms);
    }
});

export function sendEditRequest(
    data: Record<string, unknown>
): Promise<WSEditRes> {
    const id = crypto.randomUUID();
    socket.send(JSON.stringify({ id, ...data }));

    return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
    });
}

export function sendQueryRequest(
    data: Record<string, unknown>
): Promise<WSQueryRes> {
    const id = crypto.randomUUID();
    socket.send(JSON.stringify({ id, ...data }));

    return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
    });
}
