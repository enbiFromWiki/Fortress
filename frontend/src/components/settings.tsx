import { useState, type KeyboardEvent, type MouseEvent } from 'react';
import { useSettingsStore, type Settings } from '../stores/settingsstore';

export function Settings() {
    const setOpen = useSettingsStore((i) => i.setSettingsOpen);
    const open = useSettingsStore((i) => i.settingsOpen);
    const globalSettings = useSettingsStore((i) => i.settings);
    const [settings, setSettings] = useState<Settings>(globalSettings);
    const [wikiInput, setWikiInput] = useState<string>('');
    if (!open) return null;
    function clickOutsideExit(e: MouseEvent) {
        if (e.target !== e.currentTarget) return;
        setOpen(false);
    }

    function wikiInputHandler(e: KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            setSettings((s) => ({ ...s, wikis: [...s.wikis, wikiInput] }));
            setWikiInput('');
        }
    }

    return (
        <div
            onClick={clickOutsideExit}
            className="fixed modal-backdrop w-full h-full backdrop-blur-[2px] bg-[#1a1a1a66]"
        >
            <div className="absolute flex flex-col top-[50vh] left-[50vw] translate-[-50%] w-160 border border-[#3a3a3a] h-120 bg-[#1c1c1c] rounded-xl overflow-hidden">
                <div className="w-full h-8 bg-neutral-800 border-b border-b-[#3a3a3a] flex items-center justify-between">
                    <div className="center h-full p-2 text-[0.8rem] text-neutral-400">
                        Settings
                    </div>
                    <div
                        onClick={() => setOpen(false)}
                        className="text-sm center h-full p-2 hover:bg-red-500 hover:text-white transition text-neutral-300"
                    >
                        Exit
                    </div>
                </div>
                <div className="flex-1 flex w-full">
                    <div className="w-40 h-full border-r border-r-neutral-700"></div>
                    <div className="flex-1 p-2">
                        <h2 className="text-2xl  mb-5">Queue</h2>
                        <div className="editcountlimit pl-2">
                            <h3 className="text-lg">Edit count limit</h3>
                            <div className="text-[0.8rem] text-neutral-400">
                                Maximum edit count of a user before they are
                                skipped.
                            </div>
                            <input
                                type="number"
                                className="p-1 border border-neutral-800 rounded-lg transition duration-75 text-neutral-200 outline-[#0000] outline-2 focus:outline-[#ff0353]"
                                name="editcount"
                                id="ec"
                            />
                        </div>
                        <div className="wikis mt-2">
                            <h3 className="text-lg">Wikis</h3>
                            <div className="text-[0.8rem] text-neutral-400">
                                Wikis to be monitored.
                            </div>
                            <input
                                placeholder="e.g. enwiki"
                                type="text"
                                className="p-1 border border-neutral-800 rounded-md transition duration-75 text-neutral-200 text-sm outline-[#0000] outline-2 focus:outline-[#ff0353]"
                                name="editcount"
                                id="ec"
                                value={wikiInput}
                                onChange={(e) => setWikiInput(e.target.value)}
                                onKeyDown={wikiInputHandler}
                            />
                            <div className="py-2 wiki-holder flex flex-wrap gap-1">
                                {settings.wikis.map((wiki) => (
                                    <div
                                        key={crypto.randomUUID()}
                                        className="text-[0.8em] px-1.5 py-0.5 border border-neutral-800 text-neutral-200 rounded-sm"
                                    >
                                        {wiki}
                                        <span
                                            onClick={() => {
                                                setSettings((s) => ({
                                                    ...s,
                                                    wikis: s.wikis.filter(
                                                        (i) => i !== wiki
                                                    ),
                                                }));
                                            }}
                                            className="ml-1 cursor-pointer inline-block text-red-500"
                                        >
                                            {'-'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
