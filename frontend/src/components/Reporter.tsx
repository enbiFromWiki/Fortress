import { useState } from 'react';

export function Reporter({
    title,
    user,
    options,
    defaultValue: defaultValueIndex,
    onSubmit,
    name,
}: {
    title: string;
    user: string;
    options: string[][];
    onSubmit: (u: string, i: string, j: string) => void;
    name: string;
    defaultValue: number;
}) {
    const [selection, setSelection] = useState(options[defaultValueIndex][0]);
    const [additionalReason, setAdditionalReason] = useState('');
    return (
        <div className="an-fade-in flex flex-col justify-between absolute right-52 -bottom-1 bg-neutral-900 shadow px-2 pb-2 w-60 h-55 rounded-xl *:py-1 text-[0.85rem]">
            <div>
                <div className="text-red-500 mt-1! font-bold text-[1rem]">
                    {title} {user}
                </div>
                <div>
                    <label htmlFor="aiv-reason" className="pb-0.5">
                        Reason:
                    </label>
                    <select
                        name="reason"
                        id="aiv-reason"
                        className="w-full p-1 focus:outline-[#ff0353] outline-neutral-800 outline-1 focus:outline-2 py-1.5 rounded-md *:bg-neutral-900 focus:border-0 *:focus:bg-neutral-800!"
                        onChange={(e) => setSelection(e.target.value)}
                        value={selection}
                    >
                        {options.map((option) => (
                            <option value={option[0]}>{option[1]}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="mt-1">
                <label htmlFor={`${name}-additional-reason`}>
                    Additional reason:
                </label>
                <input
                    value={additionalReason}
                    onChange={(e) => setAdditionalReason(e.target.value)}
                    type="text"
                    name={`${name}-text-input`}
                    id={`${name}-additional-reason`}
                    className="text-neutral-300 px-1 block w-full py-1.25 border border-neutral-800 rounded-md transition duration-75 text-sm outline-[#0000] outline-2 focus:outline-[#ff0353]"
                />
            </div>
            <button
                onClick={() => {
                    onSubmit(user, selection, additionalReason);
                }}
                className="remove-ma-menu cursor-pointer rounded-md bg-[#ff0353] transition font-bold hover:bg-[#dd0030]"
            >
                Confirm
            </button>
        </div>
    );
}
