import {
  FastifyError,
  FastifyInstance,
  FastifyPluginOptions,
  FastifyRequest
} from 'fastify';
import { db } from '../db';

export const rawRouter = (
  app: FastifyInstance,
  _opts: FastifyPluginOptions,
  done: (error?: FastifyError) => void
) => {
  app.get('/:name', {
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

      if (paste.title) {
        res.header('X-Paste-Title', paste.title);
      }
      
      res.header('X-Paste-Visibility', paste.visibility);

      res.send(paste.body);
    }
  });

  done();
};
