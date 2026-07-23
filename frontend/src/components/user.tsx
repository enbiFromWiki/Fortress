export function UserView({
    user,
    blocked,
    gblocked,
    locked,
    watched,
    domain,
    wiki,
    className,
}: {
    user: string;
    blocked?: string[];
    gblocked?: boolean;
    locked?: boolean;
    watched?: boolean;
    domain: string;
    wiki?: string;
    className?: string;
}) {
    const classes = [];
    if (locked)
        classes.push(
            '[border-bottom-style:double] leading-[1.1] border-b-2 border-b-red-600'
        );
    if (blocked && blocked.includes(wiki ?? ''))
        classes.push('line-through italic text-neutral-500!');
    if (watched) classes.push('font-bold text-pink');
    if (gblocked)
        classes.push(
            'border-b-2 leading-[1.1] [border-bottom-style:dashed] border-b-red-600'
        );

    return (
        <a
            href={`https://${domain}/wiki/Special:Contributions/${encodeURIComponent(user)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={classes.join(' ') + (className ? ` ${className}` : '')}
        >
            {user}
        </a>
    );
}
