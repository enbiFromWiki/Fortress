import { useEditStore } from '../stores/editstore';
import { socket } from './websocket';

export function rollbackCurrentEdit() {
    const store = useEditStore.getState();
    const edit = store.edits[store.selectedIndex];
    if (!edit) return;
    const obj = {
        action: 'rollback',
        targetuser: edit.user.username,
        targettitle: edit.title,
        targetdomain: 'test.wikipedia.org',
        summary: 'test rollback',
        token: '23a231cb275475e08fefef25358f37ba6a4d231e+\\',
    };
    console.log(obj);
    socket.send(JSON.stringify(obj));
}
