import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import RevertSvg from '../assets/revert.svg?react';

export function Toolbar() {
    const [menu, setMenu] = useState<string>('');

    function handleClick() {
        setMenu((i) => (i === 'rollback' ? '' : 'rollback'));
    }
    return (
        <div className="left-[calc(2.8em+35vw)] right-[35vw] shadow-2xl border border-neutral-800 bottom-10 rounded-xl h-15 flex items-center bg-neutral-900 fixed p-1">
            <div className="relative">
                <div
                    onClick={handleClick}
                    className="hover:bg-[#222] rb-menu flex flex-col justify-center items-center transition p-1 h-full rounded-[10.482px] text-neutral-300"
                >
                    <RevertSvg className="w-6 h-6" />
                    <div className="text-[0.85rem] center">Rollback</div>
                </div>
                {menu === 'rollback' && <RollbackMenu setMenu={setMenu} />}
            </div>
        </div>
    );
}

function RollbackMenu({
    setMenu,
}: {
    setMenu: Dispatch<SetStateAction<string>>;
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
    return (
        <div
            onClick={(e) => e.stopPropagation()}
            className="rb-menu absolute left-0 bottom-15  w-50 rounded-xl bg-neutral-900 overflow-hidden"
        >
            <RollbackMenuItem />
        </div>
    );
}

function RollbackMenuItem() {
    return (
        <div className="rb-menu p-4 m-1 rounded-lg bg-[#1a1a1a] border border-[#ff035344]">
            Vandalism
        </div>
    );
}
