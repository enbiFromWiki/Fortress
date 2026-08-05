import {
    useEffect,
    useState,
    type Dispatch,
    type ReactNode,
    type SetStateAction,
} from 'react';
import type { RecentChange } from '../types/types';
import ArrowSvg from '../assets/arrow.svg?react';
import { useTranslation } from 'react-i18next';
import { reportToEnwikiAIV } from '../websocket/sendingfuncs';

type ItemState = 'aiv' | 'uaa' | 'csd' | 'srg' | '';

export function MoreActionsMenu({
    setMenu,
    edit,
}: {
    setMenu: Dispatch<SetStateAction<string>>;
    edit: RecentChange;
}) {
    const { t } = useTranslation();
    useEffect(() => {
        const handleClick = (e: PointerEvent) => {
            if (!(e.target instanceof Element)) return;

            if (
                e.target.closest('.ma-menu') &&
                !e.target.matches('.remove-ma-menu')
            )
                return;
            console.log('resetting menu');
            setMenu('');
        };
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, [setMenu]);

    const [usedItem, setUsedItem] = useState<ItemState>('');
    return (
        <div
            onClick={undefined}
            className="text-[0.925rem] text-neutral-300 an-fade-in rb-menu absolute right-0 bottom-18 flex flex-col gap-1 p-1 w-50 rounded-xl bg-neutral-900"
        >
            <MoreActionsItem
                id="aiv"
                usedItem={usedItem}
                setUsedItem={setUsedItem}
                text={t('report-to-aiv')}
            >
                <AIVReporter edit={edit} />
            </MoreActionsItem>
        </div>
    );
}

function MoreActionsItem({
    children,
    usedItem,
    setUsedItem,
    id,
    text,
}: {
    id: ItemState;
    children: ReactNode;
    usedItem: ItemState;
    text: string;
    setUsedItem: Dispatch<SetStateAction<ItemState>>;
}) {
    return (
        <div className="relative w-full h-full not-last:after:translate-y-0.5 not-last:after:absolute not-last:after:w-[90%] not-last:after:h-[0.5px] not-last:after:bottom-0 not-last:after:left-1/2 not-last:after:-translate-x-1/2 not-last:after:bg-neutral-700 not-last:after:block">
            <button
                onMouseEnter={() => setUsedItem(id)}
                className="w-full h-full hover:bg-[#1a1a1a] cursor-pointer an-fade-in relative rb-menu py-2 px-2 overflow-visible rounded-lg flex items-center justify-between"
            >
                <ArrowSvg className="h-6 block w-6 rotate-180" />
                <div className="flex-1 text-start">{text}</div>
            </button>
            {usedItem === id && children}
        </div>
    );
}

function AIVReporter({ edit }: { edit: RecentChange }) {
    const [selection, setSelection] = useState(
        'Actions evidently indicate a vandalism-only account'
    );
    const [additionalReason, setAdditionalReason] = useState('');
    return (
        <div className="an-fade-in flex flex-col justify-between absolute right-52 -bottom-1 bg-neutral-900 shadow px-2 pb-2 w-60 h-55 rounded-xl *:py-1 text-[0.85rem]">
            <div>
                <div className="text-red-500 mt-1! font-bold text-[1rem]">
                    Report {edit.user.username}
                </div>
                <div>
                    <label htmlFor="aiv-reason" className="pb-0.5">
                        Reason:
                    </label>
                    <select
                        name="reason"
                        id="aiv-reason"
                        className="w-full p-1 focus:outline-[#ff0353] outline-neutral-800 outline-1 focus:outline-2 py-1.5 rounded-md *:bg-neutral-900 focus:border-0 *:focus:bg-neutral-800!"
                        onChange={(e) => setSelection(e.target.value)}
                        value={selection}
                    >
                        <option value="Actions evidently indicate a vandalism-only account">
                            Vandalism-only account
                        </option>
                        <option value="LTA">LTA</option>
                        <option value="Actions evidently indicate a promotion-only account">
                            Promotion-only account
                        </option>
                    </select>
                </div>
            </div>
            <div className="mt-1">
                <label htmlFor="aiv-additional-reason">
                    Additional reason:
                </label>
                <input
                    value={additionalReason}
                    onChange={(e) => setAdditionalReason(e.target.value)}
                    type="text"
                    name="aiv-text-input"
                    id="aiv-additional-reason"
                    className="text-neutral-300 px-1 block w-full py-1.25 border border-neutral-800 rounded-md transition duration-75 text-sm outline-[#0000] outline-2 focus:outline-[#ff0353]"
                />
            </div>
            <button
                onClick={() => {
                    const reason = `${selection}.${additionalReason ? ` ${additionalReason}` : ''}`;
                    reportToEnwikiAIV(edit.user.username, reason);
                }}
                className="remove-ma-menu cursor-pointer rounded-md bg-[#ff0353] transition font-bold hover:bg-[#dd0030]"
            >
                Confirm
            </button>
        </div>
    );
}
