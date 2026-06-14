export function Home() {
  async function fetchDetails() {
    const res = await fetch("/call", {
      credentials: "include",
    });
    const data = await res.json();
    let html;
    if (!res.ok) {
      html = `error: ${JSON.stringify(data)}`;
    } else {
      html = JSON.stringify(data);
    }

    document.querySelector("#data-res")!.innerHTML = html;
  }

  return (
    <>
      <h1>Homepage</h1>
      <div onClick={fetchDetails}>Call API</div>
      <div id="data-res"></div>
    </>
  );
}
