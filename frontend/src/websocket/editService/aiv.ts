import { getConfig, replaceDollars } from '../../util/util';
import { sendEditRequest } from './send';
import { withToast, type ToastOptions } from './toast';

export async function reportToAivRaw(user: string, reason: string) {
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

export async function reportToAiv(user: string, reason: string) {
    const toastOptions: ToastOptions = {
        loading: {
            header: 'Reporting...',
            body: `Reporting ${user} to AIV.`,
        },

        success: {
            header: 'Reported!',
            body: `${user} reported to AIV.`,
        },

        error: (e) =>
            e.status === 'alreadygone'
                ? {
                      header: 'Failed to report',
                      body: `${user} is already reported to AIV.`,
                      status: 'normal',
                  }
                : {
                      header: 'Failed to report',
                      body: `The server returned an error code of ${e.error}.`,
                  },
    };

    withToast(reportToAivRaw(user, reason), toastOptions);
}
