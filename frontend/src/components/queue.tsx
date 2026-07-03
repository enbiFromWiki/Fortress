import { wsresponse, wsresponse2, type WSResponse } from '../testvalues';
import UserSvg from '../assets/user.svg?react';
import { calculateDiffColour } from '../util/util';

export function Queue() {
    const items = [wsresponse, wsresponse2];

    return (
        <div>
            {items.map((i) => (
                <QueueItem obj={i} key={i.newid} />
            ))}
        </div>
    );
}

function QueueItem({ obj }: { obj: WSResponse }) {
    const wikiPath = `https://${obj.domain}/wiki/`;
    return (
        <div className="text-[0.8rem] p-2 [&_a]:text-white [&_a:hover]:text-white hover:bg-neutral-800 transition">
            <div className="flex align-center justify-between px-1">
                <a
                    href={wikiPath + encodeURIComponent(obj.title)}
                    className="truncate"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {obj.title}
                </a>

                <div className="text-neutral-400 truncate">{obj.wiki}</div>
            </div>
            <div></div>
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <UserSvg className="w-4 h-4 **:fill-neutral-400 mr-1.5" />
                    <a
                        href={
                            'https://meta.wikimedia.org/wiki/Special:CA/' +
                            encodeURIComponent(obj.user.username)
                        }
                        className="text-neutral-300! truncate"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {obj.user.username}
                    </a>
                </div>
                <div style={calculateDiffColour(obj.diffsize)}>
                    {obj.diffsize > 0 ? `+${obj.diffsize}` : obj.diffsize}
                </div>
            </div>
        </div>
    );
}
