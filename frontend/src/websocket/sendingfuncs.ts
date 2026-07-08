import { useEditStore } from '../stores/editstore';
import { socket } from './websocket';

const pending = new Map();

export function sendEditRequest(
    data: Record<string, unknown>
): Promise<Record<string, unknown>> {
    const id = crypto.randomUUID();
    socket.send(JSON.stringify({ id, ...data }));

    return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
    });
}

socket.subscribe((e) => {
    const ms = JSON.parse(e.data);
    if (ms.type !== 'response') return;

    const req = pending.get(ms.id);
    if (!req) return;
    pending.delete(ms.id);
    if (ms.status === 'success') {
        req.resolve(ms);
    } else {
        req.reject(ms);
    }
});

export async function rollbackCurrentEdit(
    summary: string
): Promise<Record<string, unknown> | null> {
    const store = useEditStore.getState();
    const edit = store.edits[store.selectedIndex];
    if (!edit) return null;
    const obj = {
        action: 'rollback',
        targetuser: edit.user.username,
        targettitle: edit.title,
        targetdomain: 'test.wikipedia.org',
        summary: summary,
    };
    console.log(obj);
    const res = await sendEditRequest(obj);
    return res;
}
