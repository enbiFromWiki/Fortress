import '../styles/overseer.css';
import { LeftSection } from './leftside';
import { DiffViewer } from './diffviewer';
export function Overseer() {
    return (
        <div id="container">
            <div className="left bg-neutral-900 border-r border-r-neutral-700">
                <LeftSection />
            </div>
            <div className="middle bg-neutral-900">
                <DiffViewer />
            </div>
            <div className="right bg-neutral-900 border-l border-l-neutral-700"></div>
            <div className="top bg-neutral-900 border-b border-b-neutral-700"></div>
        </div>
    );
}

console.log('hi');
