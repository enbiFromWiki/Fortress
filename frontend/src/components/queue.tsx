import UserSvg from '../assets/user.svg?react';
import CommentSvg from '../assets/comment.svg?react';
import { calculateDiffColour } from '../util/util';
import type { WSResponse } from '../types/types';
import { useEditStore } from '../stores/editstore';

export function Queue() {
    const items = useEditStore((state) => state.edits);
    const currentInd = useEditStore((i) => i.selectedIndex);
    const setSelection = useEditStore((i) => i.manuallySetSelection);
    const visibleItems = items.slice(currentInd);
    function findAndSetSelection(obj: WSResponse) {
        const index = items.findIndex((i) => i.newid === obj.newid);
        if (index === -1) return;
        setSelection(index);
    }

    return (
        <div className="h-full overflow--y-auto overflow-x-hidden">
            {visibleItems.map((i) => (
                <QueueItem
                    obj={i}
                    key={i.newid}
                    onClick={() => findAndSetSelection(i)}
                />
            ))}
        </div>
    );
}

function QueueItem({ obj, onClick }: { obj: WSResponse; onClick: () => void }) {
    const wikiPath = `https://${obj.domain}/wiki/`;
    return (
        <div
            onClick={onClick}
            className="text-[0.85rem] not-last:after:w-[90%] not-last:after:h-[0.5px] not-last:after:bottom-0 not-last:after:left-0 not-last:after:translate-x-[5%] not-last:after:translate-y-2 not-last:after:bg-neutral-700 not-last:after:block relative first:after:translate-x-[calc(5%-4px)] first:border-l-4 first:border-l-[#ff0353] p-2 [&_a]:text-white [&_a:hover]:text-white hover:bg-neutral-800 transition"
        >
            <div className="flex align-center justify-between px-1">
                <a
                    href={wikiPath + encodeURIComponent(obj.title)}
                    className="truncate"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {obj.title}
                </a>

                <div className="text-neutral-400 text-end">{obj.wiki}</div>
            </div>
            <div></div>
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <UserSvg className="w-3.5 h-3.5 **:fill-neutral-400 mr-1.5" />
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
                <div
                    style={calculateDiffColour(obj.diffsize)}
                    className="font-mono text-end"
                >
                    {obj.diffsize > 0 ? `+${obj.diffsize}` : obj.diffsize}
                </div>
            </div>
            <div className="flex items-center">
                <CommentSvg className="w-3.5! h-3.5! min-w-3.5 min-h-3.5 **:fill-neutral-400 mr-1.5" />
                <div
                    className="truncate"
                    dangerouslySetInnerHTML={{
                        __html: obj.parsedcomment
                            ? obj.parsedcomment
                            : '<span style="color:#888;font-style:italic;">No edit summary</span>',
                    }}
                ></div>
            </div>
        </div>
    );
}
