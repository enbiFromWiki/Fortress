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

export async function rollAndWarnCurrentEdit(
    reason: string,
    template: string
): Promise<Record<string, unknown> | null> {
    const store = useEditStore.getState();
    const edit = store.selectedEdit;
    if (!edit) return null;
    const summary = `Reverting ${reason} by [[Special:Contributions/${edit.user.username}|${edit.user.username}]] ([[m:Fortress|Fortress]])`;
    const obj = {
        action: 'rollandwarn',
        targetuser: edit.user.username,
        targettitle: edit.title,
        targetdomain: edit.domain,
        summary,
        warntp: `uw-${template}`,
    };
    console.log(obj);
    const res = await sendEditRequest(obj);
    socket.send(
        JSON.stringify({ action: 'watch', targetuser: edit.user.username })
    );
    return res;
}

export function watchCurrentUser() {
    const user = useEditStore.getState().selectedEdit?.user?.username;

    socket.send(JSON.stringify({ action: 'watch', targetuser: user }));
}
