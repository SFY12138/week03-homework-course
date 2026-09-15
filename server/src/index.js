import Koa from 'koa';
import Router from '@koa/router';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser';
import serve from 'koa-static';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import { initDatabase } from './database/init.js';
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import courseRoutes from './routes/courses.js';
import studentRoutes from './routes/students.js';
import summaryRoutes from './routes/summary.js';
import staticRoutes from './routes/static.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const staticDir = join(__dirname, '../../client/dist');

const app = new Koa();
const router = new Router();

initDatabase();

app.use(cors({ credentials: true }));
app.use(bodyParser());

// 托管前端静态资源
app.use(serve(staticDir));

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    const status = err.status || 500;
    ctx.status = status;
    ctx.body = { code: status, msg: err.message || '服务器内部错误', data: null };
    console.error(`[${new Date().toISOString()}] ${err.message}`);
  }
});

router.use('/api/auth', authRoutes.routes());
router.use('/api/dashboard', dashboardRoutes.routes());
router.use('/api/courses', courseRoutes.routes());
router.use('/api/students', studentRoutes.routes());
router.use('/api/summary', summaryRoutes.routes());
router.use('/api/static', staticRoutes.routes());

app.use(router.routes());
app.use(router.allowedMethods());

// 处理所有未匹配的请求，返回前端的 index.html
app.use(async (ctx) => {
  ctx.type = 'text/html';
  ctx.body = readFileSync(join(staticDir, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务端已启动: http://localhost:${PORT}`);
});
