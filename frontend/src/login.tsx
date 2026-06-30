import './styles/login.css';

export function Login() {
    return (
        <div className="login-container">
            <h1 className="login-header">Welcome to Overseer!</h1>
            <a
                className="p-3 m-auto bg-[#ff0353] rounded-md font-bold"
                href="http://localhost:8080/login"
            >
                Login with Wikimedia
            </a>
            <p>Local or global rollback is required to use Overseer.</p>
            <p>
                Brought to you by{' '}
                <a
                    href="https://en.wikipedia.org/User:enbi"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    enbi
                </a>
            </p>
        </div>
    );
}
