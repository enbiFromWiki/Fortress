import { useEffect, useRef } from 'react';
import { diff } from '../testvalues';
import '../styles/diff.css';

export function DiffViewer() {
    const tableRef = useRef<HTMLTableSectionElement>(null);

    useEffect(() => {
        const table = tableRef.current;
        if (!table) return;

        const firstIns = table.querySelector('ins');

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
            <div className="flex justify-center items-center h-full w-full text-center">
                <div className="diff-err-holder">
                    <div className="text-9xl sad-face font-light">:{'('}</div>
                    <p className="error-text m-3">
                        FN One couldn{"'"}t fetch the diff for this edit.
                    </p>
                </div>
            </div>
        );
    }
    return (
        <div className={`diff-holder w-full h-full overflow-y-auto`}>
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
