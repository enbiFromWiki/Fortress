import { useTooltipStore } from '../stores/tooltipstore';
import '../styles/tooltip.css';

export function Tooltip() {
    const position = useTooltipStore((i) => i.position);
    const shown = useTooltipStore((i) => i.shown);
    const content = useTooltipStore((i) => i.content);
    const isHtml = useTooltipStore((i) => i.html);

    return (
        <>
            {isHtml ? (
                <div
                    className="tooltip"
                    style={{
                        position: 'fixed',
                        opacity: shown ? 1 : 0,
                        top: `${position.top}px`,
                        left: `${position.left}px`,
                    }}
                    dangerouslySetInnerHTML={{ __html: content }}
                ></div>
            ) : (
                <div
                    className="tooltip"
                    style={{
                        position: 'fixed',
                        zIndex: 9999,
                        opacity: shown ? 1 : 0,
                        top: `${position.top}px`,
                        left: `${position.left}px`,
                    }}
                >
                    {content}
                </div>
            )}
        </>
    );
}
