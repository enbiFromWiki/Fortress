import '../styles/login.css';

export function Login() {
    return (
        <div className="login-container items-center h-full *:my-1">
            <h1 className="login-header my-5 text-4xl">Welcome to Fortress!</h1>
            <a
                className="p-3 text-lg mx-auto text-white! bg-[#ff0353] hover:bg-[#dd0033] transition rounded-lg font-bold"
                href="http://localhost:8080/login"
            >
                Login with Wikimedia
            </a>
            <p className="text-sm text-slate-300">
                Local or global rollback is required to use Fortress.{' '}
                {navigator.language.startsWith('en') && (
                    <>
                        <br></br>You can apply for rollback on the English
                        Wikipedia at{' '}
                        <a href="https://test.wikipedia.org/wiki/WP:PERM/RB">
                            WP:PERM/RB
                        </a>
                        .
                    </>
                )}
            </p>
            <p className="pt-10">
                Brought to you by{' '}
                <a
                    href="https://test.wikipedia.org/User:enbi"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    enbi
                </a>
            </p>
        </div>
    );
}
