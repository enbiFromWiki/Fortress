import { useUserStore } from '../../stores/userstore';
import { socket } from '../websocket';

export function watchUser(user: string) {
    const { patchUser } = useUserStore.getState();
    patchUser(user, { watched: true });

    socket.send(JSON.stringify({ action: 'watch', targetuser: user }));
}
