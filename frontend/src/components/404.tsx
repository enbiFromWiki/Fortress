export function FourOhFour() {
    return (
        <div className="w-full h-full forbidden-holder m-auto flex flex-col justify-center items-center">
            <div className="404 font-mono text-center text-[#ff0353] text-8xl">
                404
            </div>
            <p className="text-center text-neutral-400">
                Page not found.
                <br />
                <a href="/">Go to app</a>
            </p>
        </div>
    );
}
