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
    rollAndWarnCurrentEdit as rollAndWarnCurrentEdit,
    watchCurrentUser,
} from '../websocket/sendingfuncs';

export function Fortress() {
    const increment = useEditStore((i) => i.incrementSelection);
    const decrement = useEditStore((i) => i.decrementSelection);

    useEffect(() => {
        startWs();
        document.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                e.preventDefault();
                increment();
            }
            if (e.key === '[') {
                decrement();
            }
            if (e.key === 'q') {
                rollAndWarnCurrentEdit('non-constructive edits', 'vandalism');
            }
            if (e.key === 'd') {
                rollAndWarnCurrentEdit('disruptive edits', 'disruptive');
            }
            if (e.key === 'u') {
                rollAndWarnCurrentEdit('unsourced additions', 'unsourced');
            }
            if (e.key === 't') {
                rollAndWarnCurrentEdit('test edit', 'test');
            }
            if (e.key === 'w') {
                watchCurrentUser();
            }
        });
    }, [increment, decrement]);
    return (
        <div id="container">
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
        </div>
    );
}

console.log('hi');
