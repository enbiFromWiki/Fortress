import { sendQueryRequest } from './send';

export async function getWarningLevel(
    targetuser: string,
    targetdomain: string
) {
    const res = await sendQueryRequest({
        action: 'warninglevel',
        targetuser,
        targetdomain,
    });
    if (res.level === undefined) throw new Error('bad server response');

    return { level: res.level, content: res.content };
}
