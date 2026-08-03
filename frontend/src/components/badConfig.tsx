import { Trans } from 'react-i18next';

export function BadConfig() {
    return (
        <div className="w-full h-full forbidden-holder m-auto flex flex-col justify-center items-center">
            <div className="404 font-mono text-center text-[#ff0353] text-8xl">
                502
            </div>
            <p className="text-center text-neutral-400">
                <Trans
                    i18nKey="bad-config"
                    components={[
                        <a
                            href="https://meta.wikimedia.org/wiki/Talk:Fortress/config.yaml"
                            target="_blank"
                            rel="noopener noreferrer"
                        />,
                    ]}
                />
            </p>
        </div>
    );
}
