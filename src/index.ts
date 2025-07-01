import fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import path from 'path';

const __dirname = import.meta.dirname;

const app = fastify({
  logger: true
});

app.register(fastifyStatic, {
  root: path.join(__dirname, '../static'),
  prefix: '/',
});

app.listen({ port: 8000 }, (err, address) => {
  console.log(`Listening on ${address}`);
});
