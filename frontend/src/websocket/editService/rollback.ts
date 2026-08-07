import { getSelectedEdit } from './getEdit';
import { sendEditRequest } from './send';
import { withToast, type ToastOptions } from './toast';
import { watchUser } from './watch';

export async function rollback(
    user: string,
    title: string,
    domain: string,
    summary: string
) {
    watchUser(user);

    const obj = {
        action: 'rollback',
        targetuser: user,
        targettitle: title,
        targetdomain: domain,
        summary,
    };

    const res = await sendEditRequest(obj);
    return res;
}

export async function rollbackCurrentEditNoWarn(summary: string) {
    console.log('ROLLBACK USED');
    const edit = getSelectedEdit();
    if (!edit) return;
    const { title, domain } = edit;
    const user = edit.user.username;

    const toastOptions: ToastOptions = {
        loading: {
            header: 'Reverting...',
            body: `Reverting edits by ${user}.`,
        },
        success: {
            header: 'Reverted!',
            body: `Successfully reverted edits by ${user}.`,
        },
        error: (e) => ({
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
        }),
    };
    withToast(rollback(user, title, domain, summary), toastOptions);
}
