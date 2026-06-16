export function Home() {
  async function fetchDetails() {
    const res = await fetch("/call2", {
      credentials: "include",
    });
    const data = await res.json();
    let html;
    if (!res.ok) {
      html = `error: ${JSON.stringify(data, null, 4)}`;
    } else {
      html = JSON.stringify(data, null, 4);
    }

    document.querySelector("#data-res")!.innerHTML = html;
  }

  return (
    <>
      <h1>Homepage</h1>
      <div onClick={fetchDetails}>Call API</div>
      <pre id="data-res" style={{ fontSize: "1.2em" }}></pre>
    </>
  );
}
