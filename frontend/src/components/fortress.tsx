import '../styles/fortress.css';
import { LeftSection } from './leftside';
import { DiffViewer } from './diffviewer';
import { TopBar } from './top';
import { startWs } from '../websocket/wshandler';
import { useEffect } from 'react';
import { useEditStore } from '../stores/editstore';
import { Bottom } from './bottom';
import { Infobox } from './infobox';
import { History } from './hist';
import {
    autoSetWatchedCurrentPage,
    autoSetWatchedCurrentUser,
} from '../websocket/sendingfuncs';
import { useSettingsStore } from '../stores/settingsstore';
import { handleRollbackKeyMap } from '../util/util';
import { Tooltip } from './tooltip';
import { Settings } from './settings';

export function Fortress() {
    const increment = useEditStore((i) => i.incrementSelection);
    const decrement = useEditStore((i) => i.decrementSelection);
    const scrollbar = useSettingsStore((i) => i.settings.scrollbars);

    useEffect(() => {
        startWs();
        const handleKey = (e: KeyboardEvent): void => {
            if (
                e.target instanceof HTMLElement &&
                (e.target?.matches('input, textarea') ||
                    e.target.isContentEditable)
            )
                return;

            if (e.code === 'Space' || e.key === 'ArrowRight') {
                e.preventDefault();
                const now = performance.now();
                increment();
                console.log('UPDATE TIME: ', performance.now() - now);
            } else if (e.key === '[') {
                decrement();
            } else if (e.key === 'w') {
                autoSetWatchedCurrentUser();
            } else if (e.key === 'p') {
                autoSetWatchedCurrentPage();
            } else if (e.key === 'g') {
                console.log(window.getSelection()?.toString());
            } else {
                handleRollbackKeyMap(e.key);
            }
        };
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('keydown', handleKey);
        };
    }, [decrement, increment]);
    return (
        <div id="container" className={scrollbar ? undefined : 'no-scrollbar'}>
            <div className="left bg-[#1a1a1a] border-r border-r-neutral-700">
                <LeftSection />
            </div>
            <div className="middle bg-[#1a1a1a]">
                <DiffViewer />
            </div>
            <div className="right bg-[#1a1a1a] border-l border-l-neutral-700">
                <History />
            </div>
            <div className="top bg-[#1a1a1a] border-b border-b-neutral-700 border-r border-r-neutral-700">
                <TopBar />
            </div>
            <div className="sidebar bg-[#1a1a1a] border-r border-r-neutral-700"></div>
            <div className="bottom border-t bg-[#1a1a1a] border-t-neutral-700">
                <Bottom />
            </div>
            <div className="infobox bg-[#1a1a1a] border-b border-b-neutral-700">
                <Infobox />
            </div>
            <Tooltip />
            <Settings />
        </div>
    );
}

console.log('hi');
