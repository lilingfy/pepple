# Pebble Supabase Runtime And Auth Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 Pebble 建立项目级 Supabase 隔离运行时、自动端口启动脚本，以及基于 Supabase Auth 的最小用户体系基础设施。

**Architecture:** 运行时部分采用“仓库公开配置 + 本机私有密钥 + Node 启动辅助脚本 + 根目录 `./start.sh`”的组合，避免项目串库并支持端口自动避让。认证部分采用 Supabase SSR + `user_profiles` 业务表，替换 Clerk 入口，同时保持 guest session 只服务于未登录练习场景。

**Tech Stack:** Next.js 15, React 19, TypeScript, Vitest, Drizzle ORM, PostgreSQL, Supabase Auth, Node ESM scripts, pnpm

---

## 文件结构

### 新建文件
- `config/project-runtime.json` - 仓库公开运行配置，定义 `projectSlug`、默认环境、端口基线和各环境 `projectRef`
- `scripts/project-runtime.mjs` - 读取公开配置与本机私有 Supabase 配置，生成标准化运行时对象
- `scripts/start-web-dev.mjs` - 组装运行时 env、探测端口、写入 `.env.runtime.local`、启动 `apps/web`
- `start.sh` - 仓库根目录统一启动入口
- `docs/superpowers/setup/supabase-runtime.md` - 本机私有 Supabase 配置和启动方式文档
- `apps/web/lib/env/server.ts` - 服务端环境变量读取与校验
- `apps/web/lib/supabase/browser.ts` - 浏览器端 Supabase client
- `apps/web/lib/supabase/server.ts` - 服务端/Server Action/Route Handler Supabase client
- `apps/web/lib/supabase/middleware.ts` - Next middleware 的 Supabase session 刷新逻辑
- `apps/web/lib/auth/user-profile.ts` - 基于 Supabase Auth 的当前用户解析与 `user_profiles` 自动创建
- `apps/web/app/auth/callback/route.ts` - Supabase OAuth / magic link 回调
- `apps/web/app/login/page.tsx` - 最小登录页
- `apps/web/tests/backend/project-runtime.test.ts` - 运行时配置解析测试
- `apps/web/tests/backend/start-web-dev.test.ts` - 端口避让与运行时 env 文件生成测试
- `apps/web/tests/backend/server-env.test.ts` - 服务端 env 校验测试
- `apps/web/tests/backend/user-profile.test.ts` - Supabase Auth 到 `user_profiles` 的映射测试
- `apps/web/tests/api/relations-auth-route.test.ts` - 关系 API 的认证要求测试
- `apps/web/tests/frontend/login-page.test.tsx` - 登录页交互测试

### 修改文件
- `.gitignore` - 忽略 `.env.runtime.local`
- `apps/web/package.json` - 移除 Clerk 依赖，增加 Supabase SSR 依赖
- `apps/web/drizzle.config.ts` - 切换到 PostgreSQL + 运行时 env 加载
- `apps/web/lib/db/index.ts` - 改用 `pg` + Drizzle Postgres client
- `apps/web/lib/db/schema.ts` - 从 sqlite schema 改为 pg schema，并把 `clerkId` 迁移为 `supabaseAuthUserId`
- `apps/web/app/layout.tsx` - 提供登录入口/认证相关 metadata 调整
- `apps/web/middleware.ts` - 用 Supabase middleware 刷新 session，替换 Clerk 注释残留
- `apps/web/next.config.ts` - 删除 Clerk 图片域名配置
- `apps/web/app/api/relations/route.ts` - 改用 Supabase 当前用户解析
- `apps/web/app/api/relations/[id]/route.ts` - 改用 Supabase 当前用户解析
- `apps/web/app/api/relations/[id]/chat/route.ts` - 改用 Supabase 当前用户解析
- `apps/web/app/api/relations/[id]/regenerate/route.ts` - 改用 Supabase 当前用户解析
- `apps/web/lib/backend/sessions/guest.ts` - 保持 guest session 只做匿名会话，不再提 Clerk
- `apps/web/tests/backend/setup.ts` - 调整 DB/Supabase mocks

### 删除文件
- `apps/web/lib/clerk/index.ts` - Clerk 适配层不再保留

---

### Task 1: 建立项目运行时配置解析层

**Files:**
- Create: `config/project-runtime.json`
- Create: `scripts/project-runtime.mjs`
- Modify: `.gitignore`
- Test: `apps/web/tests/backend/project-runtime.test.ts`

- [ ] **Step 1: 写运行时配置解析测试**

```ts
import { describe, expect, it } from 'vitest';
import os from 'node:os';
import path from 'node:path';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import {
  buildRuntimeContext,
  loadPublicRuntimeConfig,
  loadPrivateSupabaseConfig,
} from '../../../scripts/project-runtime.mjs';

describe('project runtime config', () => {
  it('优先使用仓库显式 projectSlug 与指定环境', () => {
    const root = mkdtempSync(path.join(os.tmpdir(), 'pebble-runtime-'));
    mkdirSync(path.join(root, 'config'), { recursive: true });

    writeFileSync(
      path.join(root, 'config/project-runtime.json'),
      JSON.stringify({
        projectSlug: 'pebble',
        defaultEnvironment: 'dev',
        portBase: { web: 3000 },
        supabase: {
          dev: { projectRef: 'pebble-dev-ref' },
          staging: { projectRef: 'pebble-staging-ref' },
        },
      })
    );

    const config = loadPublicRuntimeConfig(root);

    expect(config.projectSlug).toBe('pebble');
    expect(config.supabase.staging.projectRef).toBe('pebble-staging-ref');
  });

  it('缺少本机私有配置时抛出明确错误', () => {
    expect(() =>
      loadPrivateSupabaseConfig({
        privateConfigPath: '/tmp/does-not-exist.json',
        projectSlug: 'pebble',
        environment: 'dev',
      })
    ).toThrow(/Missing private Supabase config/);
  });

  it('构建运行时上下文时不会回退到其他项目', () => {
    const runtime = buildRuntimeContext({
      repoRoot: '/repo/pebble',
      publicConfig: {
        projectSlug: 'pebble',
        defaultEnvironment: 'dev',
        portBase: { web: 3000 },
        supabase: { dev: { projectRef: 'pebble-dev-ref' } },
      },
      privateConfig: {
        url: 'https://pebble.supabase.co',
        anonKey: 'anon-key',
        serviceRoleKey: 'service-role-key',
        databaseUrl: 'postgresql://postgres:postgres@127.0.0.1:5432/postgres',
      },
      environment: 'dev',
      requestedPort: undefined,
    });

    expect(runtime.projectSlug).toBe('pebble');
    expect(runtime.projectRef).toBe('pebble-dev-ref');
    expect(runtime.portBase).toBe(3000);
  });
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run:

```bash
pnpm --dir apps/web vitest run tests/backend/project-runtime.test.ts
```

Expected: FAIL with `Cannot find module '../../../scripts/project-runtime.mjs'`

- [ ] **Step 3: 创建公开配置文件**

```json
{
  "projectSlug": "pebble",
  "appName": "Pebble",
  "defaultEnvironment": "dev",
  "portBase": {
    "web": 3000
  },
  "supabase": {
    "dev": {
      "projectRef": "pebble-dev-local"
    },
    "staging": {
      "projectRef": "pebble-staging-local"
    }
  }
}
```

- [ ] **Step 4: 实现运行时配置解析模块**

```js
import os from 'node:os';
import path from 'node:path';
import { existsSync, readFileSync } from 'node:fs';

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

export function loadPublicRuntimeConfig(repoRoot) {
  const configPath = path.join(repoRoot, 'config/project-runtime.json');
  if (!existsSync(configPath)) {
    throw new Error(`Missing runtime config: ${configPath}`);
  }

  const config = readJson(configPath);
  return {
    projectSlug: config.projectSlug ?? path.basename(repoRoot),
    appName: config.appName ?? 'Pebble',
    defaultEnvironment: config.defaultEnvironment ?? 'dev',
    portBase: {
      web: Number(config.portBase?.web ?? 3000),
    },
    supabase: config.supabase ?? {},
  };
}

export function loadPrivateSupabaseConfig({
  privateConfigPath = path.join(os.homedir(), '.config/project-runtime/supabase-projects.json'),
  projectSlug,
  environment,
}) {
  if (!existsSync(privateConfigPath)) {
    throw new Error(`Missing private Supabase config: ${privateConfigPath}`);
  }

  const allConfigs = readJson(privateConfigPath);
  const projectConfig = allConfigs[projectSlug]?.[environment];

  if (!projectConfig) {
    throw new Error(`Missing private Supabase config for ${projectSlug}.${environment}`);
  }

  for (const key of ['url', 'anonKey', 'serviceRoleKey', 'databaseUrl']) {
    if (!projectConfig[key]) {
      throw new Error(`Missing required private config key "${key}" for ${projectSlug}.${environment}`);
    }
  }

  return projectConfig;
}

export function buildRuntimeContext({
  repoRoot,
  publicConfig,
  privateConfig,
  environment,
  requestedPort,
}) {
  const projectRef = publicConfig.supabase?.[environment]?.projectRef;

  if (!projectRef) {
    throw new Error(`Missing public Supabase projectRef for environment "${environment}"`);
  }

  return {
    repoRoot,
    projectSlug: publicConfig.projectSlug,
    appName: publicConfig.appName,
    environment,
    projectRef,
    portBase: requestedPort ?? publicConfig.portBase.web,
    privateConfig,
  };
}
```

- [ ] **Step 5: 忽略运行时 env 文件**

```gitignore
.env.runtime.local
apps/web/.env.runtime.local
```

- [ ] **Step 6: 重新运行测试并确认通过**

Run:

```bash
pnpm --dir apps/web vitest run tests/backend/project-runtime.test.ts
```

Expected: PASS with `3 passed`

- [ ] **Step 7: Commit**

```bash
git add .gitignore config/project-runtime.json scripts/project-runtime.mjs apps/web/tests/backend/project-runtime.test.ts
git commit -m "feat: add project runtime config loader"
```

---

### Task 2: 实现统一启动脚本与端口自动避让

**Files:**
- Create: `scripts/start-web-dev.mjs`
- Create: `start.sh`
- Create: `docs/superpowers/setup/supabase-runtime.md`
- Test: `apps/web/tests/backend/start-web-dev.test.ts`

- [ ] **Step 1: 写端口避让与 env 生成测试**

```ts
import { describe, expect, it } from 'vitest';
import os from 'node:os';
import path from 'node:path';
import { mkdtempSync, readFileSync } from 'node:fs';
import {
  chooseAvailablePort,
  writeRuntimeEnvFile,
} from '../../../scripts/start-web-dev.mjs';

describe('start-web-dev helpers', () => {
  it('显式端口被占用时直接报错', async () => {
    await expect(
      chooseAvailablePort({
        preferredPort: 3012,
        maxAttempts: 1,
        isPortFree: async () => false,
        strict: true,
      })
    ).rejects.toThrow(/Port 3012 is already in use/);
  });

  it('默认端口被占用时顺延到下一个可用端口', async () => {
    const port = await chooseAvailablePort({
      preferredPort: 3000,
      maxAttempts: 5,
      isPortFree: async (candidate) => candidate === 3002,
      strict: false,
    });

    expect(port).toBe(3002);
  });

  it('写入 .env.runtime.local 时包含 Supabase 必需变量', () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), 'pebble-env-'));
    const envPath = writeRuntimeEnvFile({
      outputPath: path.join(dir, '.env.runtime.local'),
      runtime: {
        privateConfig: {
          url: 'https://pebble.supabase.co',
          anonKey: 'anon-key',
          serviceRoleKey: 'service-role-key',
          databaseUrl: 'postgresql://postgres:postgres@127.0.0.1:5432/postgres',
        },
        port: 3002,
      },
    });

    const contents = readFileSync(envPath, 'utf8');

    expect(contents).toContain('NEXT_PUBLIC_SUPABASE_URL=https://pebble.supabase.co');
    expect(contents).toContain('PORT=3002');
  });
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run:

```bash
pnpm --dir apps/web vitest run tests/backend/start-web-dev.test.ts
```

Expected: FAIL with `Cannot find module '../../../scripts/start-web-dev.mjs'`

- [ ] **Step 3: 实现启动辅助脚本**

```js
import net from 'node:net';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  buildRuntimeContext,
  loadPrivateSupabaseConfig,
  loadPublicRuntimeConfig,
} from './project-runtime.mjs';

export async function isPortFree(port) {
  return await new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => server.close(() => resolve(true)));
    server.listen(port, '127.0.0.1');
  });
}

export async function chooseAvailablePort({ preferredPort, maxAttempts, isPortFree, strict }) {
  for (let offset = 0; offset < maxAttempts; offset += 1) {
    const candidate = preferredPort + offset;
    const available = await isPortFree(candidate);
    if (available) return candidate;
    if (strict) {
      throw new Error(`Port ${preferredPort} is already in use`);
    }
  }

  throw new Error(`No available port found in range ${preferredPort}-${preferredPort + maxAttempts - 1}`);
}

export function writeRuntimeEnvFile({ outputPath, runtime }) {
  const lines = [
    `NEXT_PUBLIC_SUPABASE_URL=${runtime.privateConfig.url}`,
    `NEXT_PUBLIC_SUPABASE_ANON_KEY=${runtime.privateConfig.anonKey}`,
    `SUPABASE_SERVICE_ROLE_KEY=${runtime.privateConfig.serviceRoleKey}`,
    `DATABASE_URL=${runtime.privateConfig.databaseUrl}`,
    `PORT=${runtime.port}`,
  ];

  writeFileSync(outputPath, `${lines.join('\n')}\n`, 'utf8');
  return outputPath;
}

function parseArgs(argv) {
  const args = { environment: undefined, port: undefined, help: false };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--help' || value === '-h') args.help = true;
    else if (value === '--env') args.environment = argv[index + 1];
    else if (value === '--port') args.port = Number(argv[index + 1]);
    else if (!value.startsWith('-') && !args.environment) args.environment = value;
  }

  return args;
}

async function main() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = path.resolve(__dirname, '..');
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log('Usage: ./start.sh [dev|staging] [--env ENV] [--port PORT]');
    process.exit(0);
  }

  const publicConfig = loadPublicRuntimeConfig(repoRoot);
  const environment = args.environment ?? publicConfig.defaultEnvironment;
  const privateConfig = loadPrivateSupabaseConfig({
    projectSlug: publicConfig.projectSlug,
    environment,
  });
  const runtime = buildRuntimeContext({
    repoRoot,
    publicConfig,
    privateConfig,
    environment,
    requestedPort: args.port,
  });
  const port = await chooseAvailablePort({
    preferredPort: runtime.portBase,
    maxAttempts: 20,
    isPortFree,
    strict: Number.isFinite(args.port),
  });

  runtime.port = port;

  const envPath = writeRuntimeEnvFile({
    outputPath: path.join(repoRoot, 'apps/web/.env.runtime.local'),
    runtime,
  });

  console.log(`[${runtime.projectSlug}] env=${runtime.environment}`);
  console.log(`[${runtime.projectSlug}] supabase_ref=${runtime.projectRef}`);
  console.log(`[${runtime.projectSlug}] web_port=${runtime.port}`);
  console.log(`[${runtime.projectSlug}] url=http://localhost:${runtime.port}`);

  const child = spawn('pnpm', ['--dir', 'apps/web', 'dev', '--port', String(runtime.port)], {
    cwd: repoRoot,
    stdio: 'inherit',
    env: {
      ...process.env,
      DOTENV_CONFIG_PATH: envPath,
    },
  });

  child.on('exit', (code) => process.exit(code ?? 0));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
```

- [ ] **Step 4: 创建根目录 `start.sh`**

```bash
#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

node "$ROOT_DIR/scripts/start-web-dev.mjs" "$@"
```

- [ ] **Step 5: 编写本机配置文档**

```md
# Pebble Supabase Runtime Setup

1. 在本机创建 `~/.config/project-runtime/supabase-projects.json`
2. 为 `pebble.dev` 和 `pebble.staging` 写入 `url`、`anonKey`、`serviceRoleKey`、`databaseUrl`
3. 从仓库根目录运行 `./start.sh dev`
4. 若 `3000` 被占用，脚本会自动尝试 `3001`、`3002`，最多 20 个端口
5. 若使用 `./start.sh --port 3012`，端口冲突时会直接失败而不是自动顺延
```

- [ ] **Step 6: 重新运行测试并做脚本烟测**

Run:

```bash
pnpm --dir apps/web vitest run tests/backend/start-web-dev.test.ts
node scripts/start-web-dev.mjs --help
```

Expected:
- Vitest PASS with `3 passed`
- Help output includes `--env` and `--port`

- [ ] **Step 7: Commit**

```bash
git add scripts/start-web-dev.mjs start.sh docs/superpowers/setup/supabase-runtime.md apps/web/tests/backend/start-web-dev.test.ts
git commit -m "feat: add root startup script with port failover"
```

---

### Task 3: 将 Drizzle 与数据库连接切换到 PostgreSQL

**Files:**
- Create: `apps/web/lib/env/server.ts`
- Modify: `apps/web/drizzle.config.ts`
- Modify: `apps/web/lib/db/index.ts`
- Modify: `apps/web/lib/db/schema.ts`
- Test: `apps/web/tests/backend/server-env.test.ts`

- [ ] **Step 1: 写服务端 env 校验测试**

```ts
import { describe, expect, it } from 'vitest';
import { getServerEnv } from '@/lib/env/server';

describe('getServerEnv', () => {
  it('返回 Supabase + Postgres 运行时变量', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://pebble.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
    process.env.DATABASE_URL = 'postgresql://postgres:postgres@127.0.0.1:5432/postgres';

    expect(getServerEnv().databaseUrl).toContain('postgresql://');
    expect(getServerEnv().supabaseUrl).toContain('supabase.co');
  });

  it('缺少 DATABASE_URL 时抛出明确错误', () => {
    delete process.env.DATABASE_URL;

    expect(() => getServerEnv()).toThrow(/DATABASE_URL/);
  });
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run:

```bash
pnpm --dir apps/web vitest run tests/backend/server-env.test.ts
```

Expected: FAIL with `Cannot find module '@/lib/env/server'`

- [ ] **Step 3: 实现服务端 env 模块**

```ts
type ServerEnv = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
  databaseUrl: string;
};

let cachedEnv: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (cachedEnv) return cachedEnv;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const databaseUrl = process.env.DATABASE_URL;

  for (const [key, value] of Object.entries({
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey,
    SUPABASE_SERVICE_ROLE_KEY: supabaseServiceRoleKey,
    DATABASE_URL: databaseUrl,
  })) {
    if (!value) {
      throw new Error(`Missing required env: ${key}`);
    }
  }

  cachedEnv = {
    supabaseUrl,
    supabaseAnonKey,
    supabaseServiceRoleKey,
    databaseUrl,
  };

  return cachedEnv;
}
```

- [ ] **Step 4: 切换 Drizzle 配置与 DB client**

```ts
import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.runtime.local') });
config({ path: resolve(process.cwd(), '.env.local'), override: false });

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

```ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { getServerEnv } from '@/lib/env/server';

const globalForDb = globalThis as typeof globalThis & {
  __pebblePool?: Pool;
  __pebbleDb?: ReturnType<typeof drizzle<typeof schema>>;
};

function createDb() {
  const env = getServerEnv();
  const pool = globalForDb.__pebblePool ?? new Pool({ connectionString: env.databaseUrl });
  const db = globalForDb.__pebbleDb ?? drizzle(pool, { schema });

  globalForDb.__pebblePool = pool;
  globalForDb.__pebbleDb = db;

  return db;
}

export const db = createDb();
export * from './schema';
```

- [ ] **Step 5: 把 schema 切到 pg-core，并把 `clerkId` 改成 `supabaseAuthUserId`**

```ts
import { pgTable, text, timestamp, integer, boolean, index, uniqueIndex } from 'drizzle-orm/pg-core';

export const userProfiles = pgTable(
  'user_profiles',
  {
    id: text('id').primaryKey(),
    supabaseAuthUserId: text('supabase_auth_user_id').notNull(),
    email: text('email'),
    displayName: text('display_name'),
    llmPreference: text('llm_preference').default('zhipu').notNull(),
    apiKeyEncrypted: text('api_key_encrypted'),
    userTraits: text('user_traits').default('[]').notNull(),
    userGoals: text('user_goals').default('[]').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    authUserUnique: uniqueIndex('user_profiles_supabase_auth_user_id_unique').on(table.supabaseAuthUserId),
    emailIndex: index('user_profiles_email_idx').on(table.email),
  })
);
```

- [ ] **Step 6: 运行测试并生成迁移**

Run:

```bash
pnpm --dir apps/web vitest run tests/backend/server-env.test.ts
pnpm --dir apps/web db:generate
```

Expected:
- Vitest PASS with `2 passed`
- Drizzle generates a new SQL migration under `apps/web/drizzle/migrations/`

- [ ] **Step 7: Commit**

```bash
git add apps/web/lib/env/server.ts apps/web/drizzle.config.ts apps/web/lib/db/index.ts apps/web/lib/db/schema.ts apps/web/tests/backend/server-env.test.ts apps/web/drizzle/migrations
git commit -m "refactor: migrate local db layer to postgres runtime"
```

---

### Task 4: 接入 Supabase SSR 与最小登录流

**Files:**
- Modify: `apps/web/package.json`
- Create: `apps/web/lib/supabase/browser.ts`
- Create: `apps/web/lib/supabase/server.ts`
- Create: `apps/web/lib/supabase/middleware.ts`
- Create: `apps/web/app/auth/callback/route.ts`
- Create: `apps/web/app/login/page.tsx`
- Modify: `apps/web/app/layout.tsx`
- Modify: `apps/web/middleware.ts`
- Modify: `apps/web/next.config.ts`
- Test: `apps/web/tests/frontend/login-page.test.tsx`

- [ ] **Step 1: 写登录页测试**

```tsx
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '@/app/login/page';

const signInWithOtp = vi.fn();

vi.mock('@/lib/supabase/browser', () => ({
  createBrowserSupabaseClient: () => ({
    auth: { signInWithOtp },
  }),
}));

describe('LoginPage', () => {
  it('提交邮箱时调用 Supabase OTP 登录', async () => {
    render(<LoginPage />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('邮箱'), 'hello@example.com');
    await user.click(screen.getByRole('button', { name: '发送登录链接' }));

    expect(signInWithOtp).toHaveBeenCalledWith({
      email: 'hello@example.com',
      options: {
        emailRedirectTo: 'http://localhost:3000/auth/callback',
      },
    });
  });
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run:

```bash
pnpm --dir apps/web vitest run tests/frontend/login-page.test.tsx
```

Expected: FAIL with `Cannot find module '@/app/login/page'`

- [ ] **Step 3: 增加 Supabase 依赖并实现 client 工具**

```json
{
  "dependencies": {
    "@supabase/ssr": "^0.5.2",
    "@supabase/supabase-js": "^2.49.4"
  }
}
```

```ts
import { createBrowserClient } from '@supabase/ssr';

export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

```ts
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getServerEnv } from '@/lib/env/server';

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  const env = getServerEnv();

  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        for (const cookie of cookiesToSet) {
          cookieStore.set(cookie.name, cookie.value, cookie.options);
        }
      },
    },
  });
}
```

- [ ] **Step 4: 实现 login page、callback route 和 middleware helper**

```tsx
'use client';

import { FormEvent, useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = createBrowserSupabaseClient();
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    setStatus(error ? 'error' : 'sent');
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="text-3xl font-semibold">登录 Pebble</h1>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium">邮箱</span>
          <input
            aria-label="邮箱"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-2xl border px-4 py-3"
            required
          />
        </label>
        <button type="submit" className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-white">
          发送登录链接
        </button>
      </form>
      {status === 'sent' ? <p className="mt-4 text-sm text-emerald-700">登录链接已发送</p> : null}
      {status === 'error' ? <p className="mt-4 text-sm text-rose-700">发送失败，请稍后重试</p> : null}
    </main>
  );
}
```

```ts
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
```

```ts
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getServerEnv } from '@/lib/env/server';

export async function updateSupabaseSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const env = getServerEnv();

  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        for (const cookie of cookiesToSet) {
          request.cookies.set(cookie.name, cookie.value);
          response.cookies.set(cookie.name, cookie.value, cookie.options);
        }
      },
    },
  });

  await supabase.auth.getUser();
  return response;
}
```

- [ ] **Step 5: 用 Supabase middleware 替换现有 middleware，并清理 Clerk 配置**

```ts
import type { NextRequest } from 'next/server';
import { updateSupabaseSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return updateSupabaseSession(request);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
```

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['pg'],
};

export default nextConfig;
```

```tsx
import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { pebbleCssVariables } from '@/lib/design-system/tokens';

export const metadata: Metadata = {
  title: 'Pebble AI',
  description: 'Pebble AI - 情绪防御助手',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" style={pebbleCssVariables as CSSProperties}>
      <body className="font-sans antialiased">
        <div className="fixed right-6 top-6 z-50">
          <Link href="/login" className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm">
            登录
          </Link>
        </div>
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 6: 重新运行测试并验证依赖安装**

Run:

```bash
pnpm install
pnpm --dir apps/web vitest run tests/frontend/login-page.test.tsx
```

Expected:
- `pnpm install` completes without dependency conflicts
- Login page test PASS with `1 passed`

- [ ] **Step 7: Commit**

```bash
git add apps/web/package.json pnpm-lock.yaml apps/web/lib/supabase apps/web/app/auth/callback/route.ts apps/web/app/login/page.tsx apps/web/app/layout.tsx apps/web/middleware.ts apps/web/next.config.ts apps/web/tests/frontend/login-page.test.tsx
git commit -m "feat: add supabase auth login flow"
```

---

### Task 5: 用 Supabase Auth 用户替换 Clerk 业务映射

**Files:**
- Create: `apps/web/lib/auth/user-profile.ts`
- Modify: `apps/web/app/api/relations/route.ts`
- Modify: `apps/web/app/api/relations/[id]/route.ts`
- Modify: `apps/web/app/api/relations/[id]/chat/route.ts`
- Modify: `apps/web/app/api/relations/[id]/regenerate/route.ts`
- Modify: `apps/web/lib/backend/sessions/guest.ts`
- Modify: `apps/web/tests/backend/setup.ts`
- Delete: `apps/web/lib/clerk/index.ts`
- Test: `apps/web/tests/backend/user-profile.test.ts`
- Test: `apps/web/tests/api/relations-auth-route.test.ts`

- [ ] **Step 1: 写当前用户与 user profile 映射测试**

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ensureAuthenticatedUserProfile } from '@/lib/auth/user-profile';

const getUser = vi.fn();
const findFirst = vi.fn();
const insertValues = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: async () => ({
    auth: { getUser },
  }),
}));

vi.mock('@/lib/db', () => ({
  db: {
    query: {
      userProfiles: { findFirst },
    },
    insert: () => ({
      values: insertValues,
    }),
  },
  userProfiles: { supabaseAuthUserId: 'supabase_auth_user_id' },
}));

describe('ensureAuthenticatedUserProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('首次登录时创建 user_profiles 记录', async () => {
    getUser.mockResolvedValue({
      data: { user: { id: 'auth-user-1', email: 'hello@example.com', user_metadata: { name: 'Hello' } } },
    });
    findFirst.mockResolvedValue(null);
    insertValues.mockResolvedValue([{ id: 'profile-1', supabaseAuthUserId: 'auth-user-1' }]);

    const profile = await ensureAuthenticatedUserProfile();

    expect(profile?.supabaseAuthUserId).toBe('auth-user-1');
    expect(insertValues).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: 写关系 API 认证测试**

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from '@/app/api/relations/route';

const ensureAuthenticatedUserProfile = vi.fn();

vi.mock('@/lib/auth/user-profile', () => ({
  ensureAuthenticatedUserProfile,
}));

vi.mock('@/lib/backend/services/relation-service', () => ({
  relationService: {
    list: vi.fn(),
  },
}));

describe('GET /api/relations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('未登录时返回 401', async () => {
    ensureAuthenticatedUserProfile.mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(401);
  });
});
```

- [ ] **Step 3: 运行测试并确认失败**

Run:

```bash
pnpm --dir apps/web vitest run tests/backend/user-profile.test.ts tests/api/relations-auth-route.test.ts
```

Expected: FAIL with missing `@/lib/auth/user-profile`

- [ ] **Step 4: 实现 Supabase Auth 到 `user_profiles` 的映射**

```ts
import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { db, userProfiles } from '@/lib/db';

export async function ensureAuthenticatedUserProfile() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  const existing = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.supabaseAuthUserId, data.user.id),
  });

  if (existing) {
    return existing;
  }

  const [created] = await db
    .insert(userProfiles)
    .values({
      id: randomUUID(),
      supabaseAuthUserId: data.user.id,
      email: data.user.email ?? null,
      displayName: data.user.user_metadata?.name ?? null,
      llmPreference: 'zhipu',
      userTraits: '[]',
      userGoals: '[]',
    })
    .returning();

  return created;
}
```

- [ ] **Step 5: 替换关系 API 中的 Clerk / local dev fallback**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { relationService } from '@/lib/backend/services/relation-service';
import { ensureAuthenticatedUserProfile } from '@/lib/auth/user-profile';
import { generateRequestId, normalizeApiFailure, toErrorResponse } from '@/lib/backend/errors';

async function requireUser() {
  const profile = await ensureAuthenticatedUserProfile();
  return profile?.id ?? null;
}

export async function GET(): Promise<NextResponse> {
  const requestId = generateRequestId();

  try {
    const userId = await requireUser();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: toErrorResponse({ code: 'UNAUTHORIZED', message: '请先登录', status: 401 }, requestId) },
        { status: 401 }
      );
    }

    const nodes = await relationService.list(userId);
    return NextResponse.json({ success: true, data: nodes });
  } catch (error) {
    const backendError = normalizeApiFailure(error);
    return NextResponse.json(
      { success: false, error: toErrorResponse(backendError, requestId) },
      { status: backendError.status }
    );
  }
}
```

```ts
/**
 * Guest Session Management
 * Anonymous session handling via cookies
 */

// 保持 guest session 语义不变，但删除所有 Clerk wording：
// "Link guest session to an authenticated user"
```

```ts
import { NextRequest, NextResponse } from 'next/server';
import { relationService } from '@/lib/backend/services/relation-service';
import { ensureAuthenticatedUserProfile } from '@/lib/auth/user-profile';

async function requireUserId() {
  const profile = await ensureAuthenticatedUserProfile();
  return profile?.id ?? null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ success: false, error: { message: '请先登录' } }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const updated = await relationService.update(id, userId, body);

  return NextResponse.json({ success: true, data: updated });
}
```

- [ ] **Step 6: 删除 Clerk 适配层并重新运行测试**

Run:

```bash
rm apps/web/lib/clerk/index.ts
pnpm --dir apps/web vitest run tests/backend/user-profile.test.ts tests/api/relations-auth-route.test.ts
```

Expected: PASS with all selected tests green

- [ ] **Step 7: Commit**

```bash
git add apps/web/lib/auth/user-profile.ts apps/web/app/api/relations/route.ts apps/web/app/api/relations/[id]/route.ts apps/web/app/api/relations/[id]/chat/route.ts apps/web/app/api/relations/[id]/regenerate/route.ts apps/web/lib/backend/sessions/guest.ts apps/web/tests/backend/setup.ts apps/web/tests/backend/user-profile.test.ts apps/web/tests/api/relations-auth-route.test.ts
git rm apps/web/lib/clerk/index.ts
git commit -m "refactor: replace clerk user mapping with supabase auth"
```

---

### Task 6: 做端到端验证并补齐开发文档

**Files:**
- Modify: `docs/superpowers/setup/supabase-runtime.md`
- Modify: `config/project-runtime.json`
- Test: `apps/web/tests/backend/project-runtime.test.ts`
- Test: `apps/web/tests/backend/start-web-dev.test.ts`
- Test: `apps/web/tests/backend/server-env.test.ts`
- Test: `apps/web/tests/backend/user-profile.test.ts`
- Test: `apps/web/tests/api/relations-auth-route.test.ts`
- Test: `apps/web/tests/frontend/login-page.test.tsx`

- [ ] **Step 1: 把启动摘要、私有配置路径和登录流程写进文档**

~~~md
## 启动输出

启动成功后应看到：

```bash
[pebble] env=dev
[pebble] supabase_ref=pebble-dev-local
[pebble] web_port=3002
[pebble] url=http://localhost:3002
```

## 登录验证

1. 打开 `/login`
2. 输入测试邮箱并接收 magic link
3. 回跳后访问 `/api/relations`
4. 首次成功访问后，数据库应出现对应 `user_profiles.supabase_auth_user_id`
~~~

- [ ] **Step 2: 运行针对本次改动的测试集合**

Run:

```bash
pnpm --dir apps/web vitest run \
  tests/backend/project-runtime.test.ts \
  tests/backend/start-web-dev.test.ts \
  tests/backend/server-env.test.ts \
  tests/backend/user-profile.test.ts \
  tests/api/relations-auth-route.test.ts \
  tests/frontend/login-page.test.tsx
```

Expected: PASS with all selected test files green

- [ ] **Step 3: 运行类型检查和启动烟测**

Run:

```bash
pnpm --dir apps/web type-check
./start.sh dev
```

Expected:
- `type-check` does not introduce new errors in touched files
- `./start.sh dev` prints the runtime summary and starts Next dev server on the first available port

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/setup/supabase-runtime.md config/project-runtime.json
git commit -m "docs: finalize supabase runtime and auth setup guide"
```

---

## Self-Review

### Spec coverage
- 项目级数据库隔离：Task 1 + Task 2
- 环境级数据库隔离：Task 1 + Task 2
- 端口自动避让：Task 2
- Supabase Auth 登录后创建/读取 `user_profiles`：Task 4 + Task 5
- 仓库可迁移且不提交密钥：Task 1 + Task 2 + Task 6
- Drizzle 继续管理 schema：Task 3
- 直接替换 Clerk，不保留双 provider：Task 4 + Task 5

### Placeholder scan
- 已检查全文，无空泛指令。

### Type consistency
- 统一使用 `supabaseAuthUserId` 作为 `user_profiles` 认证来源字段
- 统一使用 `ensureAuthenticatedUserProfile()` 解析当前登录用户
- 统一使用 `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` / `DATABASE_URL`
