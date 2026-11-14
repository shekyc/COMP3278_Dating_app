import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ZodError } from 'zod';
import * as repo from './repository.js';
import { resetDatabase } from '../../database/setup.js';
const app = express(),
  root = fileURLToPath(new URL('../../', import.meta.url));
const demo = process.env.DEMO_MODE === 'true';
app.disable('x-powered-by');
app.use(express.json({ limit: '32kb' }));
app.use('/api', (req, res, next) => {
  if (!demo)
    return res.status(403).json({ error: 'This application requires local DEMO_MODE=true.' });
  const origin = req.headers.origin;
  if (origin && origin !== `http://${req.headers.host}`)
    return res.status(403).json({ error: 'Cross-origin requests are disabled.' });
  next();
});
// Serialize demo API calls so reset cannot race normal queries. This tiny local app has no realtime workload.
let queue = Promise.resolve();
app.use('/api', (req, res, next) => {
  const prior = queue;
  let release!: () => void;
  queue = new Promise<void>((r) => {
    release = r;
  });
  res.once('finish', release);
  res.once('close', release);
  prior.then(() => next());
});
app.use('/api', async (req, res, next) => {
  try {
    const id = Number(req.headers['x-demo-user'] || 1);
    if (!Number.isSafeInteger(id) || id < 1) throw new repo.AppError(400, 'Invalid demo account.');
    res.locals.user = id;
    if (req.path !== '/reset') await repo.userExists(id);
    next();
  } catch (e) {
    next(e);
  }
});
app.param('id', (req, res, next, value) => {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1)
    return next(new repo.AppError(400, 'Invalid record ID.'));
  next();
});
app.get('/api/bootstrap', async (req, res) =>
  res.json({
    users: await repo.listUsers(),
    interests: await repo.rows('SELECT * FROM interests ORDER BY id'),
    profile: await repo.profile(res.locals.user),
    demo,
  }),
);
app.get('/api/discover', async (req, res) => {
  const data = await repo.discover(res.locals.user);
  res.json({
    data,
    operation: `SELECT returned ${data.length} eligible profiles; scores calculated by MySQL.`,
  });
});
app.get('/api/profiles/:id', async (req, res) =>
  res.json(await repo.profile(Number(req.params.id))),
);
app.post('/api/profiles', async (req, res) => {
  const id = await repo.saveProfile(null, req.body);
  res.status(201).json({
    id,
    operation: `COMMIT: created user ${id}, profile, preferences and interest relationships.`,
  });
});
app.put('/api/profile', async (req, res) => {
  await repo.saveProfile(res.locals.user, req.body);
  res.json({ operation: 'COMMIT: profile, preferences and interest associations updated.' });
});
app.post('/api/likes/:id', async (req, res) => {
  const result = await repo.like(res.locals.user, Number(req.params.id));
  res.json({
    ...result,
    operation: result.created
      ? `COMMIT: mutual likes detected; match ${result.matchId} inserted.`
      : 'COMMIT: like stored; duplicate requests are idempotent.',
  });
});
app.get('/api/matches', async (req, res) => res.json(await repo.matches(res.locals.user)));
app.get('/api/matches/:id/messages', async (req, res) =>
  res.json(await repo.messages(res.locals.user, Number(req.params.id))),
);
app.post('/api/matches/:id/messages', async (req, res) => {
  const id = await repo.sendMessage(res.locals.user, Number(req.params.id), req.body);
  res.status(201).json({ id, operation: `COMMIT: message ${id} inserted.` });
});
app.delete('/api/matches/:id', async (req, res) => {
  const count = await repo.unmatch(res.locals.user, Number(req.params.id));
  res.json({ operation: `COMMIT: ${count} match deleted, messages cascaded, both likes removed.` });
});
app.get('/api/saved', async (req, res) => res.json(await repo.saved(res.locals.user)));
app.post('/api/saved/:id', async (req, res) => {
  await repo.setSaved(res.locals.user, Number(req.params.id), true);
  res.json({ operation: 'COMMIT: profile saved (idempotent).' });
});
app.delete('/api/saved/:id', async (req, res) => {
  const count = await repo.setSaved(res.locals.user, Number(req.params.id), false);
  res.json({ operation: `COMMIT: ${count} saved relationship deleted.` });
});
app.get('/api/studio', async (req, res) => res.json(await repo.inspect()));
app.post('/api/reset', async (req, res) => {
  if (req.body.confirm !== 'RESET CHEMISTRY')
    throw new repo.AppError(400, 'Reset confirmation required.');
  await resetDatabase();
  res.json({ operation: 'Schema recreated; deterministic seed committed.' });
});
app.use('/api', (req, res) => res.status(404).json({ error: 'Unknown API route.' }));
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const status =
    error instanceof ZodError
      ? 400
      : error.status ||
        (error.code === 'ER_NO_REFERENCED_ROW_2' || error.code === 'ER_CHECK_CONSTRAINT_VIOLATED'
          ? 400
          : 500);
  if (status === 500) console.error(error);
  res.status(status).json({
    error:
      error instanceof ZodError
        ? error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')
        : status === 500
          ? 'Database unavailable. Check your local MySQL setup.'
          : error.message,
  });
});
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(root, 'dist')));
  app.get('/{*path}', (req, res) => res.sendFile(path.join(root, 'dist/index.html')));
} else {
  const { createServer } = await import('vite');
  const vite = await createServer({ server: { middlewareMode: true }, appType: 'spa' });
  app.use(vite.middlewares);
}
const port = Number(process.env.PORT || 3000);
app.listen(port, process.env.HOST || '127.0.0.1', () =>
  console.log(`Chemistry local demo: http://127.0.0.1:${port}`),
);
