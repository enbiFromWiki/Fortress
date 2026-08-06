import { useToastStore } from '../stores/toaststore';
import '../styles/toast.css';
import CrossSvg from '../assets/x.svg?react';

export function Toast() {
    const { toasts, deleteToast } = useToastStore();

    return (
        <div className="pointer-events-none fixed flex flex-col-reverse justify-end gap-3 right-3 *:pointer-events-auto bottom-8">
            {toasts.map((message) => {
                const isError = message.status === 'error';

                return (
                    <div
                        key={message.id}
                        className={`w-80 an-fade-in flex flex-col overflow-hidden rounded-xl bg-neutral-900 border border-neutral-800 8 ${message.status === 'error' ? 'toast-shake' : ''}`}
                    >
                        <div className="flex-1 relative px-3 py-2">
                            <div
                                onClick={() => deleteToast(message.id)}
                                className="absolute right-0 top-0 p-2 hover:bg-red-500 transition duration-100 hover:[&_.apply-stroke]:stroke-white"
                            >
                                <CrossSvg className="h-4 w-4" />
                            </div>
                            <h3 className="text-[1.1rem]">{message.header}</h3>
                            <p
                                className={`text-[0.825rem] pt-0.5 pb-1 leading-tight ${message.status !== 'error' ? 'text-neutral-400' : 'text-red-400'}`}
                            >
                                {message.body}
                            </p>
                        </div>
                        <div className="flex h-3">
                            <div
                                style={{
                                    ...(isError
                                        ? { background: '#ff030a' }
                                        : {}),
                                    width: `${message.progress}%`,
                                }}
                                className="bg-hotpink transition-[width] duration-100"
                            ></div>
                            <div className="flex-1 bg-[#1a1a1a]"></div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
