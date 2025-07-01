import fastify, { FastifyRequest } from 'fastify';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { PrismaClient } from '../.generated/client';

const __dirname = import.meta.dirname;
console.log(__dirname);

const db = new PrismaClient();

const app = fastify({
  logger: true
});

app.register(fastifyStatic, {
  root: path.join(__dirname, '../static'),
  prefix: '/'
});

type FileUpload = {
  title: string | undefined | null;
  body: string;
  visibility: 'PUBLIC' | 'ENCRYPTED';
};

function generatePostName() {
  const chars = 'abcdefgijklmnopqrstuvwxyz';
  const length = 10;
  let ret = '';

  for (let i = 0; i < length; i++) {
    ret += chars[Math.floor(Math.random() * chars.length)];
  }

  return ret;
}

async function generateUnusedPostName() {
  let postId = generatePostName();
  let used = true;
  while (used) {
    if (
      (await db.paste.count({
        where: { name: postId },
        take: 1
      })) === 0
    ) {
      used = false;
    } else {
      postId = generatePostName();
    }
  }

  return postId;
}

app.addSchema({
  $id: 'fileUpload',
  type: 'object',
  properties: {
    title: { type: 'string' },
    body: {
      type: 'string',
      maxLength: 10 * 1000 * 1000 // 10 MB max length
    },
    visibility: {
      type: 'string',
      enum: ['PUBLIC', 'ENCRYPTED']
    }
  },
  required: ['body', 'visibility']
});

app.post<{ Body: FileUpload }>('/api/paste', {
  handler: async (req, res) => {
    let { title, body, visibility } = req.body;
    if (title != null && typeof title !== 'string') {
      res.code(400).send({
        error: 'Missing required arguments'
      });
      return;
    }

    const postName = await generateUnusedPostName();
    title ||= postName;

    await db.paste.create({
      data: {
        name: postName,
        title,
        body,
        ipAddress: req.ip,
        visibility: visibility
      }
    });

    res.send({
      url: '/paste/' + postName
    });
  },
  schema: {
    body: {
      $ref: 'fileUpload'
    }
  }
});

app.get('/api/paste/:name', {
  handler: async (req: FastifyRequest<{ Params: { name: string } }>, res) => {
    const { name } = req.params;

    if (!name) {
      return res.code(400).send({
        error: 'Invalid code'
      });
    }

    const paste = await db.paste.findFirst({
      where: {
        name,
        deleted: false
      }
    });

    if (paste === null) {
      return res.code(404).send({
        error: 'Paste not found'
      });
    }

    res.send({
      name: paste.name,
      title: paste.title,
      body: paste.body,
      createdAt: paste.createdAt,
      visibility: paste.visibility
    });
  }
});

// prevent direct access to paste.html
app.get('/paste.html', async (req, res) => {
  res.code(404).send('Not found');
});

app.get(
  '/paste/:name',
  async (req: FastifyRequest<{ Params: { name: string } }>, res) => {
    return res.sendFile('paste.html');
    // const { name } = req.params;

    // const paste = await db.paste.findFirst({
    //   where: {
    //     name,
    //     deleted: false
    //   }
    // });

    // if (paste === null) {
    //   return res.code(404).send({
    //     error: 'Paste not found'
    //   });
    // }

    // res.send(paste.body);
  }
);

app.listen({ port: 8000 }, (err, address) => {
  console.log(`Listening on ${address}`);
});
