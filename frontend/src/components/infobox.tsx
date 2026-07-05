import { useEditStore } from '../stores/editstore';
import '../styles/infobox.css';
import PageSvg from '../assets/page.svg?react';
import UserSvg from '../assets/user.svg?react';
import CommentSvg from '../assets/comment.svg?react';

export function Infobox() {
    const edit = useEditStore((i) => i.edits[i.selectedIndex]);
    if (!edit) return null;

    return (
        <div className="infobox-main w-full h-full p-2">
            <div className="">
                <div className="flex items-center pb-0.75">
                    <PageSvg className="w-4.5! h-4.5! min-w-4.5 min-h-4.5 mr-1" />
                    <a
                        href={`https://${edit.domain}/wiki/${encodeURIComponent(edit.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate font-bold"
                    >
                        {edit.title}
                    </a>
                </div>
            </div>
            <div className="flex items-center pb-0.75">
                <UserSvg className="w-4! h-4! min-w-4 min-h-4 mr-1 **:fill-[#ccc]" />
                <a
                    href={`https://${edit.domain}/wiki/${encodeURIComponent(edit.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate text-[0.9rem] text-neutral-300! hover:text-neutral-200! transition"
                >
                    {edit.user.username}
                </a>
            </div>
            <div className="flex items-center">
                <CommentSvg className="w-3.5! h-3.5! min-w-3.5 min-h-3.5 **:fill-[#ccc] mr-1.5" />
                <div
                    className="truncate text-[0.9rem] text-neutral-200"
                    dangerouslySetInnerHTML={{
                        __html: edit.parsedcomment
                            ? edit.parsedcomment
                            : '<span style="color:#888;font-style:italic;">No edit summary</span>',
                    }}
                ></div>
            </div>
        </div>
    );
}
