import React from 'react'
import ReactDOMServer from 'react-dom/server'
import App from './App'

export function render() {
  const html = ReactDOMServer.renderToString(
    <React.StrictMode>
      <html lang="en">
        <head>
          <meta charSet="UTF-8" />
          <link rel="icon" type="image/svg+xml" href="/vite.svg" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>Vite + React + TS</title>
          <span
            dangerouslySetInnerHTML={{
              __html: "<!--app-head-->",
            }}
          ></span>
        </head>
        <body>
          <div id="root">
            <App />
          </div>
          <script type="module" src="/src/entry-client.tsx"></script>
        </body>
      </html>
    </React.StrictMode>
  );
  return { html }
}
