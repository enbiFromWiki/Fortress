import '../styles/overseer.css';
import { LeftSection } from './leftside';
export function Overseer() {
    return (
        <div id="container">
            <div className="left bg-neutral-950 border-r border-r-neutral-800">
                <LeftSection />
            </div>
            <div className="middle bg-neutral-950"></div>
            <div className="right bg-neutral-950 border-l border-l-neutral-800"></div>
            <div className="bottom bg-neutral-950 border-t border-t-neutral-800"></div>
        </div>
    );
}

console.log('hi');
