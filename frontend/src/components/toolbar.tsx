import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import RevertSvg from '../assets/revert.svg?react';
import ArrowSvg from '../assets/arrow.svg?react';
import {
    rollAndWarnCurrentEdit,
    setWatchedCurrentUser,
} from '../websocket/sendingfuncs';
import { useTooltip } from '../hooks/useTooltip';
import UserSvg from '../assets/user.svg?react';
import { useEditStore } from '../stores/editstore';
import { useUserStore } from '../stores/userstore';
import DotsSvg from '../assets/dots.svg?react';
import {
    DEFAULT_WARNINGS,
    type RBMenuCategory,
    type RBMenuSingleItem,
} from '../data/constants';
import { Trans } from 'react-i18next';
import { useTranslation } from 'react-i18next';

export function Toolbar() {
    const [menu, setMenu] = useState<string>('');
    const edit = useEditStore((i) =>
        i.shouldUseTemp ? i.tempItem : i.selectedEdit
    );
    const { t } = useTranslation();
    const isWatched: boolean | undefined = useUserStore(
        (i) => i.users[edit?.user?.username ?? '']?.watched
    );
    if (!edit) return null;
    const wiki = edit.wiki;

    function handleClick() {
        setMenu((i) => (i === 'rollback' ? '' : 'rollback'));
    }
    return (
        <div className="left-[calc(2.8em+35vw)] right-[35vw] shadow-2xl border border-neutral-800 bottom-10 rounded-xl h-18 flex items-center bg-neutral-900 fixed p-1 gap-1">
            <div className="relative z-auto h-full w-18">
                <button
                    onClick={handleClick}
                    className="hover:bg-[#222] w-full rb-menu flex flex-col justify-center items-center transition p-1 h-full rounded-[10.482px] text-neutral-300"
                >
                    <RevertSvg className="w-6 h-6" />
                    <div className="text-[0.8rem] center leading-[1.2] text-center">
                        <Trans i18nKey="roll-and-warn" />
                    </div>
                </button>
                {menu === 'rollback' && (
                    <RollbackMenu wiki={wiki} setMenu={setMenu} />
                )}
            </div>
            <div className="relative z-auto h-full w-18">
                <button
                    onClick={() => {
                        console.log('i');
                        setWatchedCurrentUser(!isWatched);
                    }}
                    className="hover:bg-[#222] w-full rb-menu flex flex-col justify-center items-center transition p-1 h-full rounded-[10.482px] text-neutral-300"
                >
                    <UserSvg className="w-5 h-5 m-0.5 **:fill-white" />
                    <div className="text-[0.8rem] leading-[1.2] text-center">
                        {isWatched ? t('unwatch-user') : t('watch-user')}
                    </div>
                </button>
            </div>
            <div className="relative z-auto h-full ml-auto w-18">
                <button
                    onClick={() => {
                        console.log('i');
                        setWatchedCurrentUser(!isWatched);
                    }}
                    className="hover:bg-[#222] w-full rb-menu flex flex-col justify-center items-center transition p-1 h-full rounded-[10.482px] text-neutral-300"
                >
                    <DotsSvg className="w-7 h-7" />
                    <div className="text-[0.8rem] leading-[1.2] text-center">
                        More actions
                    </div>
                </button>
            </div>
        </div>
    );
}

function RollbackMenu({
    setMenu,
    wiki,
}: {
    setMenu: Dispatch<SetStateAction<string>>;
    wiki: string;
}) {
    useEffect(() => {
        const handleClick = (e: PointerEvent) => {
            if (!(e.target instanceof Element)) return;

            if (e.target.closest('.rb-menu')) return;
            console.log('resetting menu');
            setMenu('');
        };
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, [setMenu]);

    const [usedCategory, setUsedCategory] = useState('');
    const changeCatOnHover = usedCategory !== '';
    const { t } = useTranslation();
    return (
        <div
            onClick={(e) => e.stopPropagation()}
            className="text-[0.925rem] text-neutral-300 an-fade-in rb-menu absolute left-0 bottom-18 flex flex-col gap-1 py-1 w-50 rounded-xl bg-neutral-900"
        >
            <button className="hover:bg-[#1a1a1a] not-last:after:absolute not-last:after:translate-y-0.5 not-last:after:w-[90%] not-last:after:h-[0.5px] not-last:after:bottom-0 not-last:after:left-0 not-last:after:translate-x-[5%] not-last:after:bg-neutral-700 not-last:after:block an-fade-in relative rb-menu py-2 px-2 mx-1 overflow-visible rounded-lg flex items-center justify-between">
                <div>{t('no-warn-rollback')}</div>
            </button>
            {(DEFAULT_WARNINGS[wiki] ?? []).map((i) => (
                <RollbackMenuCategory
                    key={i.name}
                    usedCategory={usedCategory}
                    onClick={() => {
                        if (usedCategory !== i.name) {
                            setUsedCategory(i.name);
                        } else {
                            setUsedCategory('');
                        }
                    }}
                    onMouseEnter={() => {
                        if (!changeCatOnHover) return;
                        setUsedCategory(i.name);
                    }}
                    category={i}
                />
            ))}
        </div>
    );
}

function RollbackMenuCategory({
    category,
    onClick,
    usedCategory,
    onMouseEnter,
}: {
    onClick?: () => void;
    onMouseEnter?: () => void;
    category: RBMenuCategory;
    usedCategory: string;
}) {
    return (
        <button
            onMouseEnter={onMouseEnter}
            onClick={onClick}
            className="hover:bg-[#1a1a1a] cursor-pointer not-last:after:translate-y-0.5 not-last:after:absolute not-last:after:w-[90%] not-last:after:h-[0.5px] not-last:after:bottom-0 not-last:after:left-0 not-last:after:translate-x-[5%] not-last:after:bg-neutral-700 not-last:after:block an-fade-in relative rb-menu py-2 px-2 mx-1 overflow-visible rounded-lg flex items-center justify-between"
        >
            <div>{category.name}</div>
            <ArrowSvg className="h-6 w-6" />

            {usedCategory === category.name && (
                <RollbackMenuItemSet items={category.entries} />
            )}
        </button>
    );
}

function RollbackMenuItemSet({ items }: { items: RBMenuSingleItem[] }) {
    const tooltip = useTooltip();
    return (
        <div
            className="an-fade-in absolute left-full top-1/2 -translate-y-1/2 ml-2 rounded-lg w-50 bg-neutral-900 shadow-md border border-neutral-800
        flex flex-col gap-1 overflow-hidden"
        >
            {items.map((item) => (
                <button
                    key={item.name}
                    onClick={() =>
                        rollAndWarnCurrentEdit(item.summary, item.template)
                    }
                    className="hover:bg-[#1a1a1a] transition cursor-pointer not-last:after:translate-y-0.5 not-last:after:absolute not-last:after:w-[90%] not-last:after:h-[0.5px] not-last:after:bottom-0 not-last:after:left-0 not-last:after:translate-x-[5%] not-last:after:bg-neutral-700 not-last:after:block an-fade-in relative rb-menu py-2 px-2 overflow-visible flex items-center"
                >
                    <div>{item.name}</div>
                    {item.details && (
                        <div
                            className="px-1.5 center cursor-help ml-1 text-neutral-500 font-bold"
                            {...tooltip}
                            data-tooltip={item.details}
                        >
                            ?
                        </div>
                    )}
                </button>
            ))}
        </div>
    );
}
