import { useEffect, useMemo, useRef } from 'react';
import '../styles/diff.css';
import { useEditStore } from '../stores/editstore';
import { useShallow } from 'zustand/shallow';
import { useSettingsStore } from '../stores/settingsstore';
import { Toolbar } from './toolbar';

export function DiffViewer() {
    const tableRef = useRef<HTMLTableSectionElement>(null);
    const shouldLink = useSettingsStore((i) => i.settings.diffLinks);
    console.log('LINK: ', shouldLink);
    const { diff, isCurrent, domain } = useEditStore(
        useShallow((state) => {
            const edit = state.shouldUseTemp
                ? state.tempItem
                : state.selectedEdit;
            return {
                domain: edit?.domain,
                diff: edit?.diffhtml,
                isCurrent: edit?.currentRevision,
            };
        })
    );
    const formattedDiff = useMemo(() => {
        if (!shouldLink || !diff || !domain) return '';

        return formatDiff(diff, domain);
    }, [diff, domain, shouldLink]);

    useEffect(() => {
        const table = tableRef.current;
        if (!table) return;

        const firstIns = table.querySelector('ins, del');

        firstIns?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        });
    }, [diff]);

    function formatDiff(diff: string, domain: string) {
        const replaced = diff
            .replace(
                /(https?:\/\/[^\s|]+)/g,
                '<a href="$1" target="_blank" class="diff-link">$1</a>'
            )
            .replace(
                /\[\[([^|\]]+)\|([^|\]]+)\]\]/g,
                (_, group, group2) =>
                    `[[<a href="https://${domain}/wiki/${encodeURIComponent(group.replace(/<\/?(?:ins|del)[^>]*>/g, ''))}" target="_blank" class="diff-link">${group}</a>|${group2}]]`
            )
            .replace(
                /\[\[([^|\]]+)\]\]/g,
                (_, group) =>
                    `[[<a href="https://${domain}/wiki/${encodeURIComponent(group.replace(/<\/?(?:ins|del)[^>]*>/g, ''))}" target="_blank" class="diff-link">${group}</a>]]`
            );
        return replaced;
    }

    if (diff === '') {
        return (
            <div className="relative flex justify-center h-full w-full text-center">
                <p className="mt-[30vh] text-neutral-400">No difference.</p>
                <Toolbar />
            </div>
        );
    }

    if (diff === 'loading') {
        return (
            <div className="relative flex justify-center h-full w-full text-center">
                <p className="mt-[30vh] text-neutral-400">Loading...</p>
                <Toolbar />
            </div>
        );
    }

    if (!diff || !domain) {
        return (
            <div className="flex relative justify-center h-full w-full text-center">
                <p className="mt-[30vh] text-neutral-400">
                    Waiting for new edit...
                </p>
                <Toolbar />
            </div>
        );
    }

    return (
        <div className="relative diff-holder w-full h-full overflow-y-auto overscroll-auto!">
            <div
                className={`mb-23 diff-radius-container ${isCurrent ? '' : 'diff-notcurrent'}`}
            >
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
                            __html: shouldLink ? formattedDiff : diff,
                        }}
                    ></tbody>
                </table>
            </div>
            <Toolbar />
        </div>
    );
}
