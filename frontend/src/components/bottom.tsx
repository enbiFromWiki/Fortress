import { useState } from 'react';
import { socket } from '../websocket/websocket';
import { useAuthStore } from '../stores/authstore';
import { useTranslation } from 'react-i18next';

export function Bottom() {
    const [playing, setPlaying] = useState(true);
    const connected = useAuthStore((i) => i.isConnected);
    const { t } = useTranslation();
    function handleClick() {
        if (playing) {
            socket.send(
                JSON.stringify({
                    action: 'pause',
                })
            );
            setPlaying(false);
        } else {
            socket.send(
                JSON.stringify({
                    action: 'resume',
                })
            );
            setPlaying(true);
        }
    }
    return (
        <div className="flex items-center justify-end h-full">
            <button
                className="text-sm center cursor-pointer text-neutral-400 px-2 transition h-full hover:bg-neutral-800"
                onClick={handleClick}
            >
                {playing ? t('ws-pause') : t('ws-unpause')}
            </button>
            <div className="text-sm center px-2 h-full transition hover:bg-neutral-800">
                {connected ? (
                    <span className="text-green-400">{t('ws-connected')}</span>
                ) : (
                    <span className="text-red-500">{t('ws-disconnected')}</span>
                )}
            </div>
        </div>
    );
}
