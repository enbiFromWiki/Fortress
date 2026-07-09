import { useEditStore } from '../stores/editstore';
import type { HistEdit } from '../types/types';
import UserSvg from '../assets/user.svg?react';
import CommentSvg from '../assets/comment.svg?react';
import { usePageStore } from '../stores/pagestore';
import { memo } from 'react';

export function History() {
    const pageKey = useEditStore((state) => {
        const edit = state.selectedEdit;
        return edit ? `${edit.title}|${edit.wiki}` : undefined;
    });
    const history = usePageStore((i) => i.pages[pageKey ?? -1]?.history);

    console.log(history);
    if (!history) return null;

    return (
        <div className="h-full overflow--y-auto overflow-x-hidden">
            {history.map((i) => (
                <HistItem obj={i} key={i.revid} onClick={() => {}} />
            ))}
        </div>
    );
}

const HistItem = memo(function HistItem({
    obj,
    onClick,
}: {
    obj: HistEdit;
    onClick: () => void;
}) {
    // const wikiPath = `https://${obj.domain}/wiki/`;
    return (
        <div
            onClick={onClick}
            className="text-[0.85rem] not-last:after:w-[90%] not-last:after:h-[0.5px] not-last:after:bottom-0 not-last:after:left-0 not-last:after:translate-x-[5%] not-last:after:translate-y-2 not-last:after:bg-neutral-700 not-last:after:block relative first:after:translate-x-[calc(5%-4px)] p-2 [&_a]:text-white [&_a:hover]:text-white hover:bg-neutral-800 transition"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <UserSvg className="w-3.5 h-3.5 **:fill-neutral-400 mr-1.5" />
                    <a
                        href={
                            'https://meta.wikimedia.org/wiki/Special:CA/' +
                            encodeURIComponent(obj.user)
                        }
                        className={`text-neutral-300! truncate ${obj.sameuser ? 'font-bold text-red-400!' : ''}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {obj.user}
                    </a>
                </div>
                {/* <div
                    style={calculateDiffColour(obj.diffsize)}
                    className="font-mono text-end"
                >
                    {obj.diffsize > 0 ? `+${obj.diffsize}` : obj.diffsize}
                </div> */}
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
});
