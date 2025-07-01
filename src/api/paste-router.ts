import {
  FastifyError,
  FastifyInstance,
  FastifyPluginOptions,
  FastifyRequest
} from 'fastify';
import { db } from '../db';
import { generateUniquePasteName } from '../paste';

type FileUpload = {
  title: string | undefined | null;
  body: string;
  visibility: 'PUBLIC' | 'ENCRYPTED';
};

export const pasteRouter = (
  app: FastifyInstance,
  _opts: FastifyPluginOptions,
  done: (error?: FastifyError) => void
) => {
  app.post<{ Body: FileUpload }>('/paste', {
    handler: async (req, res) => {
      let { title, body, visibility } = req.body;
      if (title != null && typeof title !== 'string') {
        res.code(400).send({
          error: 'Missing required arguments'
        });
        return;
      }

      const postName = await generateUniquePasteName();
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

  app.get('/paste/:name', {
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

  done();
};
