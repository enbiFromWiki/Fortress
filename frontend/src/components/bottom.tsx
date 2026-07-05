import { useState } from 'react';
import { socket } from '../websocket/websocket';

export function Bottom() {
    const [playing, setPlaying] = useState(true);
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
            <div
                className="text-sm center text-neutral-400 px-2 transition h-full hover:bg-neutral-800"
                onClick={handleClick}
            >
                {playing ? 'Pause' : 'Unpause'}
            </div>
        </div>
    );
}
