import { useTranslation } from 'react-i18next';

export function Forbidden() {
    const { t } = useTranslation();
    return (
        <div className="w-full h-full forbidden-holder m-auto flex flex-col justify-center items-center">
            <div className="403 font-mono text-center text-[#ff0353] text-8xl">
                403
            </div>
            <p className="needs-rollback text-center text-neutral-400">
                {t('rollback-needed')}
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
        </div>
    );
}
