import { useEditStore } from '../stores/editstore';
import type { HistEdit } from '../types/types';
import UserSvg from '../assets/user.svg?react';
import CommentSvg from '../assets/comment.svg?react';
import { usePageStore } from '../stores/pagestore';
import { memo } from 'react';
import { useTooltip } from '../hooks/useTooltip';
import { useShallow } from 'zustand/shallow';
import { getAndSetNewDiff } from '../util/util';

export function History() {
    const { edit, setTemp, setUseTemp, shouldUseTemp } = useEditStore(
        useShallow((state) => ({
            edit: state.shouldUseTemp ? state.tempItem : state.selectedEdit,
            temp: state.tempItem,
            setTemp: state.setTempItem,
            setUseTemp: state.setShouldUseTemp,
            shouldUseTemp: state.shouldUseTemp,
        }))
    );
    const pageKey = edit ? `${edit.title}|${edit.wiki}` : undefined;
    const history = usePageStore((i) => i.pages[pageKey ?? -1]?.history);
    const tooltip = useTooltip();
    console.log('history rerendered');
    if (!edit) return null;
    if (!history) return null;

    return (
        <div className="hist-holder w-full h-full flex flex-col">
            <div
                className="bg-[#1a1a1a] center w-full h-15 border-b border-b-neutral-700"
                onClick={() => {
                    if (shouldUseTemp) {
                        setUseTemp(false);
                        return;
                    }
                    getAndSetNewDiff(
                        edit.newid,
                        edit.oldid,
                        edit.domain,
                        setTemp,
                        setUseTemp
                    );
                }}
            ></div>
            <div className="h-full overflow--y-auto overflow-x-hidden">
                {history.map((i) => (
                    <HistItem
                        isCurr={i.revid === edit?.newid}
                        isOld={i.revid === edit?.diffid}
                        obj={i}
                        key={i.revid}
                        domain={edit.domain}
                        tooltip={tooltip}
                    />
                ))}
            </div>
        </div>
    );
}

const HistItem = memo(function HistItem({
    obj,
    isCurr,
    isOld,
    tooltip,
    domain,
}: {
    obj: HistEdit;
    // onClick: () => void;
    isCurr: boolean;
    isOld: boolean;
    tooltip: Record<string, unknown>;
    domain: string;
}) {
    const setTempEdit = useEditStore((s) => s.setTempItem);
    const setUseTempEdit = useEditStore((s) => s.setShouldUseTemp);

    const handleClick = () => {
        getAndSetNewDiff(
            obj.revid,
            obj.parentid,
            domain,
            setTempEdit,
            setUseTempEdit
        );
    };
    // const wikiPath = `https://${obj.domain}/wiki/`;
    return (
        <div
            onClick={handleClick}
            className={`text-[0.85rem] not-last:after:w-[90%] not-last:after:h-[0.5px] not-last:after:bottom-0 not-last:after:left-0 not-last:after:translate-x-[5%] not-last:after:translate-y-2 not-last:after:bg-neutral-700 not-last:after:block relative first:after:translate-x-[calc(5%-4px)] p-2 text-white [&:hover]:text-white hover:bg-neutral-800 transition ${isCurr ? 'bg-neutral-800!' : ''} ${isOld ? 'bg-[#202020]' : ''}`}
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
