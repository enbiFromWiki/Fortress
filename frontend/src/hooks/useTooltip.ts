import { useTooltipStore } from '../stores/tooltipstore';
import type { PointerEvent } from 'react';

// Hook used to add tooltips.

export function useTooltip() {
    const setPosition = useTooltipStore((s) => s.setPosition);
    const setContent = useTooltipStore((s) => s.setContent);
    const setShown = useTooltipStore((s) => s.setShown);
    const setHtml = useTooltipStore((s) => s.setHtml);

    function onPointerEnter(e: PointerEvent) {
        const el = e.currentTarget as HTMLElement;
        if (el.className === 'tooltip') return;

        const rect = el.getBoundingClientRect();
        const content = el.dataset.tooltip;

        if (!content) return;

        if (el.getAttribute('data-tooltip-html')) {
            setHtml(true);
        } else {
            setHtml(false);
        }

        setPosition({
            top: rect.bottom + 7,
            left: content.length > 10 ? rect.left - 15 : rect.left - 5,
        });

        setContent(content);
        setShown(true);
    }

    function onPointerLeave(e: PointerEvent) {
        if ((e.currentTarget as HTMLElement).className === 'tooltip') return;
        setShown(false);
    }

    return {
        onPointerEnter,
        onPointerLeave,
    };
}
