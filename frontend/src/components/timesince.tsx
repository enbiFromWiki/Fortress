import { useEffect, useState } from 'react';

export function TimeSince(time: string | number) {
    const [timeSince, setTimeSince] = useState(
        Math.round((new Date().getTime() - new Date(time).getTime()) / 1000)
    );
    useEffect(() => {
        const unsub = setInterval(() => setTimeSince((i) => i + 1), 1000);
        return () => clearInterval(unsub);
    });

    function since(t: number) {
        if (t >= 60 * 60 * 24 * 365) {
            const years = Math.round(t / (60 * 60 * 24 * 365));
            return `${years} year${years === 1 ? '' : 's'} ago`;
        } else if (t >= 60 * 60 * 24 * 30) {
            const months = Math.round(t / (60 * 60 * 24 * 30));
            return `${months} month${months === 1 ? '' : 's'} ago`;
        } else if (t >= 60 * 60 * 24) {
            const days = Math.round(t / (60 * 60 * 24));
            return `${days} day${days === 1 ? '' : 's'} ago`;
        } else if (t >= 3600) {
            const hours = Math.round(t / 3600);
            return `${hours} hour${hours === 1 ? '' : 's'} ago`;
        } else if (t >= 60) {
            const mins = Math.round(t / 60);
            return `${mins} hour${mins === 1 ? '' : 's'} ago`;
        } else {
            return `${t} second${t === 1 ? '' : 's'} ago`;
        }
    }

    return <span>{since(timeSince)}</span>;
}
