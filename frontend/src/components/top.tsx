import { useAuthStore } from '../stores/authstore';
import { useSettingsStore } from '../stores/settingsstore';
import { rollAndWarnCurrentEdit } from '../websocket/sendingfuncs';
import Delete from '../assets/bin.svg?react';
import { useTooltip } from '../hooks/useTooltip';
import { useEditStore } from '../stores/editstore';
import SettingsSvg from '../assets/settings.svg?react';

export function TopBar() {
    const tooltip = useTooltip();
    const clearQueue = useEditStore((i) => i.clearQueue);
    async function rollback() {
        try {
            await rollAndWarnCurrentEdit('non-constructive edits', 'vandalism');
        } catch {
            console.log('err above/below right?');
        }
    }
    const setOpen = useSettingsStore((i) => i.setSettingsOpen);

    // async function logout() {
    //     const res = await fetchCred('http://localhost:8080/logout');
    //     if (!res.ok) return;
    //     window.location.replace('/loginpage');
    // }

    const user = useAuthStore((i) => i.user);
    console.log('TOP RERENDERED');

    return (
        <div className=" flex items-center px-1 h-full justify-end">
            {user && (
                <div
                    onClick={rollback}
                    className="text-[0.9rem] text-neutral-300 hover:bg-neutral-800 transition px-2 py-1 rounded-md"
                >
                    {user}
                </div>
            )}
            <div className="text-[0.9rem] text-neutral-300 hover:bg-neutral-800 transition py-1 px-2 rounded-md">
                Edit
            </div>
            <div className="text-[0.9rem] text-neutral-300 hover:bg-neutral-800 transition px-2 py-1 rounded-md">
                User
            </div>
            <div
                onClick={() => setOpen(true)}
                className="text-[0.9rem] text-neutral-300 hover:bg-neutral-800 transition px-1 py-0.75 rounded-md"
            >
                <SettingsSvg className="w-6 h-6" />
            </div>{' '}
            <div
                {...tooltip}
                data-tooltip="Remove all edits from queue"
                onClick={clearQueue}
                className="text-[0.9rem] text-neutral-300 hover:bg-neutral-800 transition px-1 py-0.75 rounded-md"
            >
                <Delete className="w-6 h-6" />
            </div>{' '}
        </div>
    );
}
