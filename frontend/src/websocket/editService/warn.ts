import { sendEditRequest } from './send';

type WarnActionAcceptedJSON = {
    action: 'warn';
    template: string;
    targetuser: string;
    targetdomain: string;
    summary: string;
    title?: string;
    content?: string;
};

export async function warnUser(
    user: string,
    domain: string,
    fullTemplate: string,
    summary: string,
    content: string | undefined = undefined
) {
    const params: WarnActionAcceptedJSON = {
        action: 'warn',
        template: fullTemplate,
        targetuser: user,
        targetdomain: domain,
        summary,
    };
    if (content !== undefined) params.content = content;

    const res = await sendEditRequest(params);
    return res;
}
