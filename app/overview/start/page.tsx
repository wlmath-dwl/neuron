export default function Page() {
  return (
    <article className="prose">
      <h1>安装</h1>
      <pre>
        <code>npm install @realsee/atom-paint</code>
      </pre>
      <h1>初始化</h1>
      <iframe
        src="https://codesandbox.io/embed/l4w3o6my59?view=editor+%2B+preview&module=%2Fsrc%2Findex.js"
        style={{ width: '100%', height: '500px', border: '1px solid #333' }}
        title="React Codesandbox"
        allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
        sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
      ></iframe>
    </article>
  );
}
