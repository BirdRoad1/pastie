import fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileUploadSchema } from './schema/api-schema.js';
import { pasteRouter } from './router/api/paste-router.js';
import { rawRouter } from './router/raw-router.js';

const __dirname = import.meta.dirname;

const isDev = process.env.NODE_ENV === 'development';

const app = fastify({
  logger: isDev
});

const staticDir = path.join(__dirname, isDev ? '../static' : './static');

app.register(fastifyStatic, {
  root: staticDir,
  prefix: '/'
});

app.addSchema(fileUploadSchema);

app.register(pasteRouter, {
  prefix: '/api/'
});

app.register(rawRouter, {
  prefix: '/raw/'
});

// prevent direct access to paste.html
app.get('/paste.html', async (_, res) => {
  return res.sendFile('404.html');
});

app.get('/paste/:name', async (_, res) => {
  return res.sendFile('paste.html');
});

app.setNotFoundHandler((_, res) => {
  return res.sendFile('404.html');
});

app.listen({ port: 8000 }, (err, address) => {
  if (err) {
    console.log('Listen failed:', err);
  } else {
    console.log(`Listening on ${address}`);
  }
});
