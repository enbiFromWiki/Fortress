import { useEditStore } from '../stores/editstore';
import type { HistEdit } from '../types/types';
import UserSvg from '../assets/user.svg?react';
import CommentSvg from '../assets/comment.svg?react';
import { usePageStore } from '../stores/pagestore';
import { memo } from 'react';
import { useTooltip } from '../hooks/useTooltip';

export function History() {
    const edit = useEditStore((state) => state.selectedEdit);
    const pageKey = edit ? `${edit.title}|${edit.wiki}` : undefined;
    const history = usePageStore((i) => i.pages[pageKey ?? -1]?.history);
    const tooltip = useTooltip();
    if (!edit) return null;
    if (!history) return null;

    return (
        <div className="h-full overflow--y-auto overflow-x-hidden">
            {history.map((i) => (
                <HistItem
                    isCurr={i.revid === edit?.newid}
                    obj={i}
                    key={i.revid}
                    onClick={() => {}}
                    tooltip={tooltip}
                    domain={edit.domain}
                />
            ))}
        </div>
    );
}

const HistItem = memo(function HistItem({
    obj,
    onClick,
    isCurr,
    tooltip,
    domain,
}: {
    obj: HistEdit;
    onClick: () => void;
    isCurr: boolean;
    tooltip: Record<string, unknown>;
    domain: string;
}) {
    // const wikiPath = `https://${obj.domain}/wiki/`;
    return (
        <div
            onClick={onClick}
            className={`text-[0.85rem] not-last:after:w-[90%] not-last:after:h-[0.5px] not-last:after:bottom-0 not-last:after:left-0 not-last:after:translate-x-[5%] not-last:after:translate-y-2 not-last:after:bg-neutral-700 not-last:after:block relative first:after:translate-x-[calc(5%-4px)] p-2 text-white [&:hover]:text-white hover:bg-neutral-800 transition ${isCurr ? 'bg-neutral-800!' : ''}`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <UserSvg className="w-3.5 h-3.5 **:fill-neutral-400 mr-1.5" />
                    <a
                        href={`https://${domain}/wiki/Special:Contributions/${encodeURIComponent(obj.user)}`}
                        className={`text-neutral-300 truncate ${obj.sameuser ? 'font-bold text-blue-400!' : ''}`}
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
                    {...tooltip}
                    data-tooltip={obj.parsedcomment}
                    data-tooltip-html
                ></div>
            </div>
        </div>
    );
});
