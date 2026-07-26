import { useTranslation } from 'react-i18next';

export function FourOhFour() {
    const { t } = useTranslation();
    return (
        <div className="w-full h-full forbidden-holder m-auto flex flex-col justify-center items-center">
            <div className="404 font-mono text-center text-[#ff0353] text-8xl">
                404
            </div>
            <p className="text-center text-neutral-400">
                {t('page-not-found')}
                <br />
                <a href="/">{t('go-to-app')}</a>
            </p>
        </div>
    );
}
