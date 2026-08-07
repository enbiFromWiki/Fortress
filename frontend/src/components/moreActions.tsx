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
import { Reporter } from './Reporter';
import { reportToAiv } from '../websocket/editService/aiv';

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
    return (
        <Reporter
            title="Report"
            name="aiv"
            user={edit.user.username}
            options={[
                [
                    'Actions evidently indicate a vandalism-only account',
                    'Vandalism-only account',
                ],
                [
                    'Actions evidently indicate a promotion-only account',
                    'Promotion-only account',
                ],
                ['LTA', 'Long-term abuse'],
            ]}
            defaultValue={0}
            onSubmit={reportToAivFromComponent}
        />
    );
}

function reportToAivFromComponent(
    user: string,
    selection: string,
    additionalReason: string
) {
    const reason = `${selection}.${additionalReason ? ` ${additionalReason}` : ''}`;
    reportToAiv(user, reason);
}
