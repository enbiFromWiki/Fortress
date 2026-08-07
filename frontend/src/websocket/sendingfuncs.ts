import { useEditStore } from '../stores/editstore';
import { usePageStore } from '../stores/pagestore';
import { useToastStore } from '../stores/toaststore';
import { useUserStore } from '../stores/userstore';
import type { Filter } from '../types/types';
import { getConfig, replaceDollars } from '../util/util';
import { socket } from './websocket';
import { sendEditRequest } from './editService/send';

export async function rollbackAndAutoWarnCurrentEdit(
    summary: string,
    template: string,
    warnsummary: string | null = null
): Promise<Record<string, unknown> | null> {
    const store = useEditStore.getState();
    const edit = store.selectedEdit;

    if (!edit) return null;

    if (!warnsummary) {
        warnsummary = getConfig()?.[edit.wiki]?.warnSummary ?? null;
    }
    if (!warnsummary) {
        throw new Error('no config');
    }
    warnsummary = replaceDollars(warnsummary, edit.user.username, '$1');
    console.log('warn summary: ', warnsummary);
    const obj = {
        action: 'rollandwarn',
        targetuser: edit.user.username,
        targettitle: edit.title,
        targetdomain: edit.domain,
        summary,
        warnsummary,
        warntp: `uw-${template}`,
        level: 'auto',
    };
    console.log(obj);
    watchCurrentUser();
    const res = await sendEditRequest(obj);
    return res;
}

export async function reportToEnwikiAIV(user: string, reason: string) {
    const summary =
        getConfig()?.['testwiki']?.reportSummary ??
        'Reporting [[Special:Contributions/$1|$1]] (Fortress-Beta)';
    const res = await sendEditRequest({
        action: 'aiv',
        summary: replaceDollars(summary, user),
        targetuser: user,
        reason: reason,
    });
    console.log(res);
    return res;
}

export async function reportToEnwikiAIVWithToast(user: string, reason: string) {
    const id = crypto.randomUUID();
    const { addToast, updateToast, deleteToast } = useToastStore.getState();
    addToast({
        header: 'Reporting...',
        body: `Reporting ${user} to AIV.`,
        progress: 100 / 3,
        status: 'normal',
        id,
    });
    try {
        await reportToEnwikiAIV(user, reason);
        updateToast(id, {
            header: 'Reported!',
            body: `${user} successfully reported to AIV.`,
            progress: 100,
            status: 'done',
        });
    } catch (err) {
        const e = err as Record<string, unknown>;
        if (e.status === 'alreadygone') {
            updateToast(id, {
                header: 'Failed to report',
                body: `${user} is already reported to AIV.`,
                progress: 0,
            });
        } else {
            updateToast(id, {
                header: 'Failed to report',
                body:
                    e.error === 'http'
                        ? 'Please report to the development team.'
                        : e.error === 'editconflict'
                          ? "Your edit conflicted with another editor's."
                          : `Error code: ${e.error}`,
                status: 'error',
                progress: 100,
            });
        }
    } finally {
        setInterval(() => deleteToast(id), 4000);
    }
}

export async function rollbackCurrentEditWithEnglishSummary(
    reason: string | null = null
): Promise<Record<string, unknown> | null> {
    const store = useEditStore.getState();
    const edit = store.selectedEdit;
    if (!edit) return null;
    const summary =
        reason !== null
            ? `Reverting ${reason} by [[Special:Contributions/${edit.user.username}|${edit.user.username}]] (Fortress-Beta)`
            : `Reverting edits (Fortress-Beta)`;
    const obj = {
        action: 'rollback',
        targetuser: edit.user.username,
        targettitle: edit.title,
        targetdomain: edit.domain,
        summary,
    };
    console.log(obj);
    watchCurrentUser();
    const res = await sendEditRequest(obj);
    return res;
}

export async function rollbackAndToastCurrentEdit(summary: string) {
    const id = crypto.randomUUID();
    const { addToast, updateToast, deleteToast } = useToastStore.getState();
    addToast({
        header: 'Reverting...',
        body: 'Reverting edits without warning the user.',
        progress: 100 / 3,
        status: 'normal',
        id,
    });
    try {
        await oldRollbackCurrentEdit(summary);
        updateToast(id, {
            header: 'Reverted!',
            body: 'Edits successfully reverted.',
            progress: 100,
            status: 'done',
        });
    } catch (err) {
        const e = err as Record<string, unknown>;
        updateToast(id, {
            header: 'Failed to revert',
            body:
                e.error === 'alreadyrolled'
                    ? 'This edit is not the current revision.'
                    : e.error === 'editconflict'
                      ? "Your edit conflicted with another editor's."
                      : e.error === 'rollback-nochange'
                        ? 'If you rolled back, the result would be the same as the current revision.'
                        : e.error === 'onlyauthor'
                          ? 'The user being reverted is the only person to ever edit the page.'
                          : e.error === 'http'
                            ? 'Please contact the developers.'
                            : e.error === 'permissiondenied'
                              ? 'Either you lost rollback rights mid-patrol, or you should contact the developers.'
                              : e.error === 'missingtitle'
                                ? 'The page got deleted before you reverted.'
                                : `Error code: ${e.error}`,

            status: 'error',
            progress: 100,
        });
    } finally {
        setInterval(() => deleteToast(id), 4000);
    }
}

export async function oldRollbackCurrentEdit(
    summary: string
): Promise<Record<string, unknown> | null> {
    const store = useEditStore.getState();
    const edit = store.selectedEdit;
    if (!edit) return null;
    const obj = {
        action: 'rollback',
        targetuser: edit.user.username,
        targettitle: edit.title,
        targetdomain: edit.domain,
        summary,
    };
    console.log(obj);
    watchCurrentUser();
    const res = await sendEditRequest(obj);
    return res;
}

export async function rollAndAutoWarnCurrentEditWithEnglishSummary(
    reason: string,
    template: string
): Promise<Record<string, unknown> | null> {
    const store = useEditStore.getState();
    const edit = store.selectedEdit;
    if (!edit) return null;
    const summary = `Reverting ${reason} by [[Special:Contributions/${edit.user.username}|${edit.user.username}]] (Fortress-Beta)`;
    const obj = {
        action: 'rollandwarn',
        targetuser: edit.user.username,
        targettitle: edit.title,
        targetdomain: edit.domain,
        summary,
        warntp: `uw-${template}`,
        level: 'auto',
    };
    console.log(obj);
    watchCurrentUser();
    const res = await sendEditRequest(obj);
    return res;
}

export async function rollAndSingleIssueWarnCurrentEditWithEnglishSummary(
    reason: string,
    template: string
): Promise<Record<string, unknown> | null> {
    const store = useEditStore.getState();
    const edit = store.selectedEdit;
    if (!edit) return null;
    const summary = `Reverting ${reason} by [[Special:Contributions/${edit.user.username}|${edit.user.username}]] (Fortress-Beta)`;
    const obj = {
        action: 'rollandwarn',
        targetuser: edit.user.username,
        targettitle: edit.title,
        targetdomain: edit.domain,
        summary,
        warntp: `uw-${template}`,
        level: 'single',
    };
    console.log(obj);
    watchCurrentUser();
    const res = await sendEditRequest(obj);
    return res;
}

export async function rollAndSingleIssueWarnCurrentEdit(
    summary: string,
    template: string,
    warnsummary: string | null = null
): Promise<Record<string, unknown> | null> {
    const edit = useEditStore.getState().selectedEdit;
    if (!edit) return null;
    if (!warnsummary) {
        warnsummary = getConfig()?.[edit.wiki]?.warnSummary ?? null;
    }
    if (!warnsummary) {
        throw new Error('no config');
    }
    warnsummary = replaceDollars(warnsummary, edit.user.username, template);
    const obj = {
        action: 'rollandwarn',
        targetuser: edit.user.username,
        targettitle: edit.title,
        targetdomain: edit.domain,
        summary,
        warnsummary,
        warntp: `uw-${template}`,
        level: 'single',
    };
    console.log(obj);
    watchCurrentUser();
    const res = await sendEditRequest(obj);
    return res;
}

export function watchCurrentUser() {
    const user = useEditStore.getState().selectedEdit?.user?.username;
    const patchUser = useUserStore.getState().patchUser;
    if (!user) return;

    patchUser(user, { watched: true });

    socket.send(JSON.stringify({ action: 'watch', targetuser: user }));
}

export function unwatchCurrentUser() {
    const user = useEditStore.getState().selectedEdit?.user?.username;
    const patchUser = useUserStore.getState().patchUser;
    if (!user) return;

    patchUser(user, { watched: false });

    socket.send(JSON.stringify({ action: 'unwatch', targetuser: user }));
}

export function setWatchedCurrentUser(watch: boolean) {
    const user = useEditStore.getState().selectedEdit?.user?.username;
    const patchUser = useUserStore.getState().patchUser;
    if (!user) {
        console.log('fail');
        return;
    }

    patchUser(user, { watched: watch });

    if (watch) {
        socket.send(JSON.stringify({ action: 'watch', targetuser: user }));
    } else {
        socket.send(JSON.stringify({ action: 'unwatch', targetuser: user }));
    }
}

export function autoSetWatchedCurrentUser() {
    const user = useEditStore.getState().selectedEdit?.user?.username;
    const patchUser = useUserStore.getState().patchUser;
    const watched = !!useUserStore.getState().users[user ?? '']?.watched;
    if (!user) {
        console.log('fail');
        return;
    }

    patchUser(user, { watched: !watched });
    console.log(useUserStore.getState());

    if (!watched) {
        socket.send(JSON.stringify({ action: 'watch', targetuser: user }));
    } else {
        socket.send(JSON.stringify({ action: 'unwatch', targetuser: user }));
    }
}

export function watchCurrentPage() {
    const patchPage = usePageStore.getState().patchPage;
    const edit = useEditStore.getState().selectedEdit;
    if (!edit) return;
    const title = edit.title;
    const wiki = edit.wiki;
    patchPage(title, wiki, { watched: true });
    socket.send(
        JSON.stringify({
            action: 'watchPage',
            targetwiki: wiki,
            targettitle: title,
        })
    );
}

export function autoSetWatchedCurrentPage() {
    const patchPage = usePageStore.getState().patchPage;
    const edit = useEditStore.getState().selectedEdit;
    if (!edit) return;
    const title = edit.title;
    const wiki = edit.wiki;
    const key = title && wiki ? `${title}|${wiki}` : '';
    const watched = !!usePageStore.getState().pages[key]?.watched;
    if (!title) {
        console.log('fail');
        return;
    }

    patchPage(title, wiki, { watched: !watched });
    console.log(usePageStore.getState().pages);

    if (!watched) {
        socket.send(
            JSON.stringify({
                action: 'watchPage',
                targettitle: title,
                targetwiki: wiki,
            })
        );
    } else {
        socket.send(
            JSON.stringify({
                action: 'unwatchPage',
                targettitle: title,
                targetwiki: wiki,
            })
        );
    }
}

export async function rollAndAutoWarnCurrentEdit(
    summary: string,
    template: string,
    warnsummary: string | null = null
): Promise<Record<string, unknown> | null> {
    const store = useEditStore.getState();
    const edit = store.selectedEdit;

    if (!edit) return null;

    if (!warnsummary) {
        warnsummary = getConfig()?.[edit.wiki]?.warnSummary ?? null;
    }
    if (!warnsummary) {
        throw new Error('no config');
    }
    warnsummary = replaceDollars(warnsummary, edit.user.username, '$1');
    console.log('warn summary: ', warnsummary);
    const obj = {
        action: 'rollandwarn',
        targetuser: edit.user.username,
        targettitle: edit.title,
        targetdomain: edit.domain,
        summary,
        warnsummary,
        warntp: `uw-${template}`,
        level: 'auto',
    };
    console.log(obj);
    watchCurrentUser();
    const res = await sendEditRequest(obj);
    return res;
}

export function changeFilters(filters: Filter) {
    console.log('qwertyuiop');
    socket.send(JSON.stringify({ action: 'updatefilters', filters }));
}
