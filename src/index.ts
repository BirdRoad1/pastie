import fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileUploadSchema } from './schema/api-schema';
import { pasteRouter } from './api/paste-router';

const __dirname = import.meta.dirname;

const app = fastify({
  logger: process.env.NODE_ENV === 'development'
});

app.register(fastifyStatic, {
  root: path.join(__dirname, '../static'),
  prefix: '/'
});

app.addSchema(fileUploadSchema);

app.register(pasteRouter, {
  prefix: '/api/'
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
