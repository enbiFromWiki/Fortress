import { useTranslation } from 'react-i18next';
import '../styles/login.css';

export function Login() {
    const { t } = useTranslation();
    return (
        <div className="bg-[#1a1a1a] w-full h-full">
            <div className="login-container items-center h-full *:my-1">
                <h1 className="login-header my-5 text-4xl">{t('welcome')}</h1>
                <a
                    className="p-3 text-lg mx-auto text-white! bg-[#ff0353] hover:bg-[#dd0033] transition rounded-lg font-bold"
                    href="http://localhost:8080/login"
                >
                    {t('login-with-wikimedia')}
                </a>
                <p className="text-sm text-slate-300">
                    {t('rollback-needed-login')}
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
                    {t('brought-by')}{' '}
                    <a
                        href="https://test.wikipedia.org/User:enbi"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        enbi
                    </a>
                </p>
            </div>
        </div>
    );
}
