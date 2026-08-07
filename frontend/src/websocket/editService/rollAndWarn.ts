import { useEditStore } from '../../stores/editstore';
import { useToastStore } from '../../stores/toaststore';
import { getConfig } from '../../util/util';
import { reportToAivRaw } from './aiv';
import { getWarningLevel } from './query';
import { rollback } from './rollback';
import type { WSEditRes, WSQueryRes } from './toast';
import { warnUser } from './warn';

export async function rollAndManualWarnCurrentEdit(
    fullTemplate: string,
    rbSummary: string,
    warnSummary: string
) {
    const id = crypto.randomUUID();
    const { updateToast, deleteToast, addToast } = useToastStore.getState();
    try {
        const edit = useEditStore.getState().selectedEdit;
        if (!edit) return;

        const user = edit.user.username;
        const { domain, title } = edit;

        addToast({
            id,
            progress: 15,
            header: 'Reverting...',
            body: `Reverting edits by ${user}`,
            status: 'normal',
        });
        try {
            await rollback(user, title, domain, rbSummary);
            updateToast(id, {
                progress: 40,
                header: 'Getting talk content...',
                body: `Getting talk page content for ${user}.`,
            });
        } catch (err) {
            const e = err as WSEditRes;
            updateToast(id, {
                status: 'error',
                header: 'Failed to revert',
                body: `Server responded with error code of \`${e.error}\``,
                progress: 3,
            });
            return;
        }
        let content: string | undefined;
        try {
            ({ content } = await getWarningLevel(user, domain));
            updateToast(id, {
                progress: 60,
                header: 'Warning...',
                body: `Adding warning template to ${user}'s talk page.`,
            });
        } catch (err) {
            const e = err as WSQueryRes;
            updateToast(id, {
                progress: 3,
                header: 'Failed to get content',
                body: `Server responded with an error of \`${e.error}\`.`,
            });
            return;
        }
        try {
            await warnUser(user, domain, fullTemplate, warnSummary, content);
            updateToast(id, {
                status: 'done',
                progress: 100,
                header: 'Warned!',
                body: `Successfully reverted edits by and warned ${user}.`,
            });
        } catch (err) {
            const e = err as WSEditRes;
            updateToast(id, {
                status: 'done',
                progress: 3,
                header: 'Failed to warn',
                body: `Server responded with an error of \`${e.error}\`.`,
            });
            return;
        }
    } finally {
        setTimeout(() => deleteToast(id), 4000);
    }
}

export async function rollAndAutoWarnCurrentEdit(
    template: string,
    rbSummary: string,
    warnSummary: string,
    reportSummary: string | undefined = undefined
) {
    const id = crypto.randomUUID();
    const { updateToast, deleteToast, addToast } = useToastStore.getState();
    try {
        const edit = useEditStore.getState().selectedEdit;
        if (!edit) return;
        const config = getConfig();
        if (!config) return;

        const user = edit.user.username;
        const { domain, title, wiki } = edit;

        const useAiv = !!config[wiki]?.aiv;

        addToast({
            id,
            progress: 15,
            header: 'Reverting...',
            body: `Reverting edits by ${user}`,
            status: 'normal',
        });
        try {
            await rollback(user, title, domain, rbSummary);
            updateToast(id, {
                progress: 40,
                header: 'Getting talk content...',
                body: `Getting talk page content for ${user}.`,
            });
        } catch (err) {
            const e = err as WSEditRes;
            updateToast(id, {
                status: 'error',
                header: 'Failed to revert',
                body: `Server responded with error code of \`${e.error}\``,
                progress: 3,
            });
            return;
        }
        let content: string | undefined;
        let level: number;
        try {
            ({ content, level } = await getWarningLevel(user, domain));
        } catch (err) {
            const e = err as WSQueryRes;
            updateToast(id, {
                progress: 3,
                header: 'Failed to get content',
                body: `Server responded with an error of \`${e.error}\`.`,
            });
            return;
        }
        if (useAiv && level >= 4) {
            try {
                updateToast(id, {
                    progress: 60,
                    header: 'Reporting...',
                    body: `Reporting ${user} to AIV.`,
                });
                await reportToAivRaw(
                    user,
                    'Vandalism past final warning.',
                    reportSummary
                );
                updateToast(id, {
                    status: 'done',
                    progress: 100,
                    header: 'Reported',
                    body: `Successfully reported ${user} to AIV.`,
                });
            } catch (err) {
                const e = err as WSEditRes;
                updateToast(id, {
                    status: 'done',
                    progress: 3,
                    header: 'Failed to report',
                    body: `Server responded with an error of \`${e.error}\`.`,
                });
                return;
            }
        } else {
            try {
                updateToast(id, {
                    progress: 60,
                    header: 'Warning...',
                    body: `Adding warning to ${user}'s talk page.`,
                });
                await warnUser(
                    user,
                    domain,
                    `uw-${template}${level + 1}`,
                    warnSummary,
                    content
                );
                updateToast(id, {
                    status: 'done',
                    progress: 100,
                    header: 'Warned!',
                    body: `Successfully reverted edits by and warned ${user}.`,
                });
            } catch (err) {
                const e = err as WSEditRes;
                updateToast(id, {
                    status: 'done',
                    progress: 3,
                    header: 'Failed to warn',
                    body: `Server responded with an error of \`${e.error}\`.`,
                });
                return;
            }
        }
    } finally {
        setTimeout(() => deleteToast(id), 4000);
    }
}
