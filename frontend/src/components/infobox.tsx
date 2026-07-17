import { useEditStore } from '../stores/editstore';
import '../styles/infobox.css';
import PageSvg from '../assets/page.svg?react';
import UserSvg from '../assets/user.svg?react';
import CommentSvg from '../assets/comment.svg?react';
import { useTooltip } from '../hooks/useTooltip';
import { calculateDiffColour } from '../util/util';

export function Infobox() {
    const edit = useEditStore((i) =>
        i.shouldUseTemp ? i.tempItem : i.selectedEdit
    );
    const tooltip = useTooltip();
    if (!edit) return null;
    const sizePercentage =
        Math.round(((edit.newsize - edit.oldsize) / edit.oldsize) * 1000) / 10;

    return (
        <div className="infobox-main flex justify-between w-full h-full p-2">
            <div className="flex-1 min-w-0">
                <div className="w-[75%]">
                    <div className="flex items-center pb-0.75">
                        <PageSvg className="w-4.5! h-4.5! min-w-4.5 min-h-4.5 mr-1" />
                        <a
                            href={`https://${edit.domain}/wiki/${encodeURIComponent(edit.title)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="truncate font-bold"
                            {...tooltip}
                            data-tooltip={edit.title}
                        >
                            {edit.title}
                        </a>
                    </div>
                </div>
                <div className="flex items-center pb-0.75">
                    <UserSvg className="w-4! h-4! min-w-4 min-h-4 mr-1 **:fill-[#ccc]" />
                    <a
                        href={`https://${edit.domain}/wiki/${encodeURIComponent(edit.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate text-[0.9rem] text-neutral-300! hover:text-neutral-200! transition"
                    >
                        {edit.user.username}
                    </a>
                </div>
                <div className="flex w-full items-center">
                    <CommentSvg className="w-3.5! h-3.5! min-w-3.5 min-h-3.5 **:fill-[#ccc] mr-1.5" />
                    <div
                        className="truncate text-[0.9rem] text-neutral-200"
                        dangerouslySetInnerHTML={{
                            __html: edit.parsedcomment
                                ? edit.parsedcomment
                                : '<span style="color:#888;font-style:italic;">No edit summary</span>',
                        }}
                    ></div>
                </div>
            </div>
            <div className="**:text-end">
                <div
                    style={calculateDiffColour(edit.diffsize)}
                    className="font-mono text-end"
                >
                    {edit.diffsize > 0 ? `+${edit.diffsize}` : edit.diffsize}
                </div>
                <div className="text-[0.8rem] text-neutral-400 text-end">
                    {`${sizePercentage > 0 ? `+${sizePercentage}` : sizePercentage === 0 && edit.diffsize !== 0 ? `~${sizePercentage}` : sizePercentage}%`}
                </div>
            </div>
        </div>
    );
}
