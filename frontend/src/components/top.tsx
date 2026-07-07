import { useAuthStore } from '../stores/authstore';
import { fetchCred } from '../util/util';
import { rollbackCurrentEdit } from '../websocket/sendingfuncs';

export function TopBar() {
    async function logout() {
        const res = await fetchCred('http://localhost:8080/logout');
        if (!res.ok) return;
        window.location.replace('/loginpage');
    }

    const user = useAuthStore((i) => i.user);

    return (
        <div className=" flex items-center px-1 h-full justify-around">
            {user && (
                <div
                    onClick={rollbackCurrentEdit}
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
            <div className="text-[0.9rem] text-neutral-300 hover:bg-neutral-800 transition px-2 py-1 rounded-md">
                Settings
            </div>{' '}
            <div className="text-[0.9rem] text-neutral-300 hover:bg-neutral-800 transition px-2 py-1 rounded-md">
                Warn
            </div>{' '}
        </div>
    );
}
