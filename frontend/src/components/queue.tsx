import UserSvg from '../assets/user.svg?react';
import CommentSvg from '../assets/comment.svg?react';
import { calculateDiffColour } from '../util/util';
import type { RecentChange } from '../types/types';
import { useEditStore } from '../stores/editstore';
import { memo } from 'react';
import { useShallow } from 'zustand/shallow';
import { useTranslation } from 'react-i18next';

export function Queue() {
    const { selectedEdit, futureEdits } = useEditStore(
        useShallow((state) => ({
            futureEdits: state.futureEdits,
            selectedEdit: state.selectedEdit,
            setTempEdit: state.setTempItem,
            tempEdit: state.tempItem,
            setUseTempEdit: state.setShouldUseTemp,
        }))
    );
    // function fetchTempEdit(i: WSResponse) {
    //     setTempEdit(i);
    //     setUseTempEdit(true);
    // }
    const visibleEdits = [selectedEdit, ...futureEdits];
    // function findAndSetSelection(obj: WSResponse) {
    //     const index = items.findIndex((i) => i.newid === obj.newid);
    //     if (index === -1) return;
    //     setSelection(index);
    // }

    return (
        <div className="h-full overflow--y-auto overflow-x-hidden">
            {visibleEdits.map((i) =>
                i ? (
                    <QueueItem
                        obj={i}
                        key={i.newid}
                        current={i.newid === selectedEdit?.newid}
                    />
                ) : null
            )}
        </div>
    );
}

const QueueItem = memo(function QueueItem({
    obj,
    current,
}: {
    obj: RecentChange;
    current: boolean;
}) {
    const { t } = useTranslation();
    const setTempEdit = useEditStore((s) => s.setTempItem);
    const setUseTempEdit = useEditStore((s) => s.setShouldUseTemp);

    const handleClick = () => {
        setTempEdit(obj);
        setUseTempEdit(true);
    };
    const wikiPath = `https://${obj.domain}/wiki/`;
    return (
        <div
            onClick={handleClick}
            className={`text-[0.85rem] not-last:after:w-[90%] not-last:after:h-[0.5px] not-last:after:bottom-0 not-last:after:left-0 not-last:after:translate-x-[5%] not-last:after:translate-y-2 not-last:after:bg-neutral-700 not-last:after:block relative ${current ? 'after:translate-x-[calc(5%-4px)] border-l-4 border-l-[#ff0353]' : ''} p-2 [&_a]:text-white [&_a:hover]:text-white hover:bg-neutral-800 transition`}
        >
            <div className="w-full min-w-0 flex align-center justify-between pl-1">
                <a
                    href={wikiPath + encodeURIComponent(obj.title)}
                    className={`truncate ${obj.pagewatched ? 'text-pink font-bold' : ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {obj.title}
                </a>

                <div className="text-neutral-400 text-end">{obj.wiki}</div>
            </div>
            <div></div>
            <div className="min-w-0 w-full flex items-center justify-between">
                <div className="flex flex-1 items-center min-w-0">
                    <UserSvg className="shrink-0 w-3.5 h-3.5 **:fill-neutral-400 mr-1.5" />
                    <a
                        href={`https://${obj.domain}/wiki/Special:Contributions/${encodeURIComponent(obj.user.username)}`}
                        className={`text-neutral-300 min-w-0 truncate ${obj.watched ? 'font-bold text-[#ff0353]!' : ''}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {obj.user.username}
                    </a>
                </div>
                <div
                    style={calculateDiffColour(obj.diffsize)}
                    className="font-mono text-end min-w-0"
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
                            : `<span style="color:#888;font-style:italic;">${t('no-edit-summary')}</span>`,
                    }}
                ></div>
            </div>
        </div>
    );
});
