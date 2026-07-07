import { useEffect, useRef } from 'react';
import '../styles/diff.css';
import { useEditStore } from '../stores/editstore';
import { useShallow } from 'zustand/shallow';

export function DiffViewer() {
    const tableRef = useRef<HTMLTableSectionElement>(null);
    const { diff, isCurrent } = useEditStore(
        useShallow((state) => {
            const edit = state.edits[state.selectedIndex];
            return {
                diff: edit?.diffhtml,
                isCurrent: edit?.currentRevision,
            };
        })
    );

    useEffect(() => {
        const table = tableRef.current;
        if (!table) return;

        const firstIns = table.querySelector('ins, del');

        if (firstIns) {
            firstIns.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, []);

    function formatDiff(diff: string) {
        const replaced = diff
            .replace(
                /\[\[([^|\]]+)\]\]/g,
                (_, group) =>
                    `[[<a href="${encodeURIComponent(group)}" target="_blank" class="diff-link">${group}</a>]]`
            )
            .replace(
                /\[\[([^|\]]+)\|([^|\]]+)\]\]/g,
                (_, group, group2) =>
                    `[[<a href="${encodeURIComponent(group)}" target="_blank" class="diff-link">${group}</a>|${group2}]]`
            )
            .replace(
                /(https?:\/\/[^\s|]+)/g,
                '<a href="$1" target="_blank" class="diff-link">$1</a>'
            );
        return replaced;
    }

    if (!diff) {
        return (
            <div className="flex justify-center h-full w-full text-center">
                <p className="mt-[30vh] text-neutral-400">
                    Waiting for new edit...
                </p>
            </div>
        );
    }
    return (
        <div
            className={`diff-holder w-full h-full overflow-y-auto ${isCurrent ? '' : 'diff-notcurrent'}`}
        >
            <div className="diff-radius-container">
                <table className="diff">
                    <colgroup>
                        <col className="diff-marker" />
                        <col className="diff-content" />
                        <col className="diff-marker" />
                        <col className="diff-content" />
                    </colgroup>
                    <tbody
                        ref={tableRef}
                        dangerouslySetInnerHTML={{
                            __html: formatDiff(diff),
                        }}
                    ></tbody>
                </table>
            </div>
        </div>
    );
}
