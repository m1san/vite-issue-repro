//@ts-check
import fs from 'node:fs/promises'
import Fastify from 'fastify'
import middie from '@fastify/middie';

// Constants
const isProduction = process.env.NODE_ENV === 'production'
const port = process.env.PORT || 5173
const base = process.env.BASE || '/'

// Cached production assets
const templateHtml = isProduction
  ? await fs.readFile('./dist/client/index.html', 'utf-8')
  : ''
const ssrManifest = isProduction
  ? await fs.readFile('./dist/client/ssr-manifest.json', 'utf-8')
  : undefined

// Create http server
const app = Fastify({});
await app.register(middie, {});


// Add Vite or respective production middlewares
let vite
if (!isProduction) {
  const { createServer } = await import('vite')
  vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    base: '/ssr-app/'
  })
  app.use(vite.middlewares)
} else {
  const compression = (await import('compression')).default
  const sirv = (await import('sirv')).default
  app.use(base, sirv('./dist/client', { extensions: [] }))
}

// Serve HTML
app.get('*', async (req, res) => {
  try {
    const url = req.originalUrl.replace(base, '')

    let template
    let render

    // This is just the dev mode setup
    template = ''
    render = (await vite.ssrLoadModule('/src/entry-server.tsx')).render

   // Assume this is an RSC render (reason why the whole HTML comes from render)
    const rendered = await render(url, ssrManifest)
    template = await vite.transformIndexHtml(url, rendered.html)

    const html = template
      .replace(`<!--app-head-->`, rendered.head ?? '')

    res.status(200).header('Content-Type', 'text/html').send(html)
  } catch (e) {
    vite?.ssrFixStacktrace(e)
    console.log(e.stack)
    res.status(500).send(e.stack)
  }
})

// Start http server
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`)
})
