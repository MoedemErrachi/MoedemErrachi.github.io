import http from "node:http";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const cmsDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(process.env.PORTFOLIO_ROOT || path.join(cmsDir, ".."));
const publicDir = path.join(cmsDir, "public");
const contentFile = path.join(rootDir, "content", "portfolio.json");
const publicAssetsDir = path.join(rootDir, "public");
const uploadsDir = path.join(publicAssetsDir, "uploads");
const outDir = path.join(rootDir, "out");

const PORT = Number(process.env.CMS_PORT || 4321);
const HOST = "127.0.0.1";

const state = {
  build: { running: false, code: null, log: [], startedAt: null },
  publish: { running: false, code: null, log: [], startedAt: null },
};

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
  });
  res.end(body);
}

function sendText(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(body);
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

function run(command, args, cwd) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd,
      shell: false,
      env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => (stdout += d.toString()));
    child.stderr.on("data", (d) => (stderr += d.toString()));
    child.on("error", (error) => resolve({ code: 1, stdout, stderr: String(error) }));
    child.on("close", (code) => resolve({ code: code ?? 1, stdout, stderr }));
  });
}

const git = (args) => run("git", args, rootDir);

async function gitStatus() {
  const [branch, status, log] = await Promise.all([
    git(["rev-parse", "--abbrev-ref", "HEAD"]),
    git(["status", "--porcelain"]),
    git(["log", "-1", "--pretty=%h %s (%cr)"]),
  ]);

  const changes = status.stdout
    .split("\n")
    .filter(Boolean)
    .map((line) => ({
      status: line.slice(0, 2).trim(),
      file: line.slice(3).trim(),
    }));

  return {
    branch: branch.stdout.trim(),
    lastCommit: log.stdout.trim(),
    changes,
    clean: changes.length === 0,
  };
}

async function listAssets() {
  const results = [];
  const walk = async (dir, prefix) => {
    if (!fs.existsSync(dir)) return;
    for (const entry of await fsp.readdir(dir, { withFileTypes: true })) {
      const abs = path.join(dir, entry.name);
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        await walk(abs, rel);
      } else {
        const stat = await fsp.stat(abs);
        results.push({
          path: `/${rel}`,
          size: stat.size,
          modified: stat.mtime.toISOString(),
        });
      }
    }
  };
  await walk(publicAssetsDir, "");
  return results.sort((a, b) => a.path.localeCompare(b.path));
}

function sanitizeFileName(name) {
  const base = path.basename(String(name || "upload"));
  const cleaned = base
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+/, "");
  return cleaned || "upload";
}

function isInside(parent, child) {
  const rel = path.relative(parent, child);
  return rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel));
}

async function serveStatic(res, baseDir, urlPath, { fallbackIndex = true } = {}) {
  const decoded = decodeURIComponent(urlPath);
  const target = path.resolve(baseDir, `.${path.posix.normalize(decoded)}`);

  if (!isInside(baseDir, target)) {
    return false;
  }

  const candidates = fallbackIndex
    ? [target, path.join(target, "index.html"), `${target}.html`]
    : [target];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      const ext = path.extname(candidate).toLowerCase();
      const stat = fs.statSync(candidate);
      res.writeHead(200, {
        "Content-Type": MIME[ext] || "application/octet-stream",
        "Content-Length": stat.size,
        "Cache-Control": "no-store",
      });
      fs.createReadStream(candidate).pipe(res);
      return true;
    }
  }

  return false;
}

function isPrimitiveArray(value) {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((item) => item === null || typeof item !== "object")
  );
}

function isFlatObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const keys = Object.keys(value);
  if (!keys.length) return false;
  return keys.every((key) => {
    const item = value[key];
    return (
      item === null ||
      typeof item !== "object" ||
      (typeof item === "string" && item.length <= 40)
    );
  });
}

/**
 * Serialises JSON keeping short arrays and flat objects on a single line, which
 * matches the hand-written style of content/portfolio.json.
 */
function formatJson(value, indent = 0) {
  const pad = "  ".repeat(indent);
  const padInner = "  ".repeat(indent + 1);

  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    if (isPrimitiveArray(value)) {
      const inline = value.map((item) => JSON.stringify(item)).join(", ");
      return `[${inline}]`;
    }
    if (isFlatObject(value[0]) && value.every(isFlatObject)) {
      const inline = value
        .map((item) => `{ ${Object.entries(item)
          .map(([key, entry]) => `${JSON.stringify(key)}: ${JSON.stringify(entry)}`)
          .join(", ")} }`)
        .join(", ");
      if (inline.length + pad.length <= 100) return `[${inline}]`;
    }
    const items = value.map((item) => `${padInner}${formatJson(item, indent + 1)}`);
    return `[\n${items.join(",\n")}\n${pad}]`;
  }

  if (value && typeof value === "object") {
    const keys = Object.keys(value);
    if (keys.length === 0) return "{}";
    const items = keys.map(
      (key) => `${padInner}${JSON.stringify(key)}: ${formatJson(value[key], indent + 1)}`,
    );
    return `{\n${items.join(",\n")}\n${pad}}`;
  }

  return JSON.stringify(value);
}

async function handleApi(req, res, pathname) {
  if (req.method === "GET" && pathname === "/api/state") {
    const [content, gitInfo, assets, build, publish] = await Promise.all([
      fsp.readFile(contentFile, "utf8").then(JSON.parse),
      gitStatus(),
      listAssets(),
      Promise.resolve(state.build),
      Promise.resolve(state.publish),
    ]);
    sendJson(res, 200, {
      content,
      git: gitInfo,
      assets,
      build,
      publish,
      rootDir,
    });
    return true;
  }

  if (req.method === "PUT" && pathname === "/api/content") {
    const raw = await readBody(req);
    let parsed;
    try {
      parsed = JSON.parse(raw.toString("utf8"));
    } catch {
      sendJson(res, 400, { error: "Invalid JSON payload" });
      return true;
    }
    const problem = validateContent(parsed);
    if (problem) {
      sendJson(res, 400, { error: problem });
      return true;
    }
    await fsp.writeFile(contentFile, `${formatJson(parsed)}\n`, "utf8");
    sendJson(res, 200, { ok: true, savedAt: new Date().toISOString() });
    return true;
  }

  if (req.method === "POST" && pathname === "/api/upload") {
    const rawName = req.headers["x-file-name"];
    const raw = await readBody(req);
    if (!raw.length) {
      sendJson(res, 400, { error: "Empty upload" });
      return true;
    }
    const name = sanitizeFileName(Array.isArray(rawName) ? rawName[0] : rawName);
    const target = path.join(uploadsDir, name);
    if (!isInside(publicAssetsDir, target)) {
      sendJson(res, 400, { error: "Invalid file name" });
      return true;
    }
    await fsp.mkdir(path.dirname(target), { recursive: true });
    await fsp.writeFile(target, raw);
    sendJson(res, 200, { ok: true, path: `/uploads/${name}`, size: raw.length });
    return true;
  }

  if (req.method === "DELETE" && pathname.startsWith("/api/assets/")) {
    const rel = decodeURIComponent(pathname.slice("/api/assets/".length));
    const target = path.resolve(publicAssetsDir, `.${path.posix.normalize(`/${rel}`)}`);
    if (!isInside(publicAssetsDir, target) || target === publicAssetsDir) {
      sendJson(res, 400, { error: "Invalid path" });
      return true;
    }
    if (!fs.existsSync(target)) {
      sendJson(res, 404, { error: "Asset not found" });
      return true;
    }
    await fsp.unlink(target);
    sendJson(res, 200, { ok: true });
    return true;
  }

  if (req.method === "POST" && pathname === "/api/build") {
    if (state.build.running) {
      sendJson(res, 409, { error: "A build is already running" });
      return true;
    }
    state.build = { running: true, code: null, log: [], startedAt: Date.now() };
    sendJson(res, 202, { ok: true });

    const child = spawn("npm", ["run", "build"], {
      cwd: rootDir,
      shell: process.platform === "win32",
      env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
    });
    const push = (line) => {
      state.build.log.push(line);
      if (state.build.log.length > 500) state.build.log.shift();
    };
    child.stdout.on("data", (d) => String(d).split(/\r?\n/).filter(Boolean).forEach(push));
    child.stderr.on("data", (d) => String(d).split(/\r?\n/).filter(Boolean).forEach(push));
    child.on("error", (error) => {
      push(String(error));
      state.build.running = false;
      state.build.code = 1;
    });
    child.on("close", (code) => {
      state.build.running = false;
      state.build.code = code ?? 1;
    });
    return true;
  }

  if (req.method === "POST" && pathname === "/api/publish") {
    if (state.publish.running) {
      sendJson(res, 409, { error: "A publish is already running" });
      return true;
    }
    const raw = await readBody(req);
    let message = "Update portfolio content";
    try {
      const parsed = JSON.parse(raw.toString("utf8") || "{}");
      if (typeof parsed.message === "string" && parsed.message.trim()) {
        message = parsed.message.trim().slice(0, 200);
      }
    } catch {
      /* keep default message */
    }

    state.publish = { running: true, code: null, log: [], startedAt: Date.now() };
    sendJson(res, 202, { ok: true });

    const push = (line) => {
      state.publish.log.push(line);
      if (state.publish.log.length > 500) state.publish.log.shift();
    };

    const build = await run("npm", ["run", "build"], rootDir);
    push(build.stdout.trim());
    if (build.stderr.trim()) push(build.stderr.trim());
    if (build.code !== 0) {
      push("Build failed - publish aborted.");
      state.publish.running = false;
      state.publish.code = build.code;
      return true;
    }

    const add = await git(["add", "-A"]);
    if (add.stderr.trim()) push(add.stderr.trim());
    if (add.code !== 0) {
      state.publish.running = false;
      state.publish.code = add.code;
      return true;
    }

    const status = await gitStatus();
    if (status.clean) {
      push("Nothing to commit - working tree is clean.");
      state.publish.running = false;
      state.publish.code = 0;
      return true;
    }

    const commit = await git(["commit", "-m", message]);
    push(commit.stdout.trim() || commit.stderr.trim());
    if (commit.code !== 0) {
      state.publish.running = false;
      state.publish.code = commit.code;
      return true;
    }

    const pushResult = await git(["push", "origin", "HEAD"]);
    push(pushResult.stdout.trim());
    if (pushResult.stderr.trim()) push(pushResult.stderr.trim());

    state.publish.running = false;
    state.publish.code = pushResult.code;
    return true;
  }

  return false;
}

function validateContent(value) {
  if (!value || typeof value !== "object") return "Content must be an object";
  if (!value.profile || typeof value.profile !== "object") return "Missing profile";
  if (!value.profile.name || !String(value.profile.name).trim()) {
    return "Profile name is required";
  }
  if (!value.about || typeof value.about !== "object") return "Missing about";
  if (!Array.isArray(value.about.paragraphs)) return "about.paragraphs must be an array";
  if (!Array.isArray(value.about.highlights)) return "about.highlights must be an array";
  if (!value.sections || typeof value.sections !== "object") return "Missing sections";
  for (const key of [
    "experience",
    "skills",
    "hackathons",
    "projects",
    "education",
    "contact",
  ]) {
    if (!value.sections[key] || typeof value.sections[key] !== "object") {
      return `Missing sections.${key}`;
    }
  }
  for (const key of ["experience", "skills", "hackathons", "projects", "education"]) {
    if (!Array.isArray(value[key])) return `${key} must be an array`;
  }
  if (!Array.isArray(value.certifications)) return "certifications must be an array";
  if (!Array.isArray(value.languages)) return "languages must be an array";
  if (!value.seo || typeof value.seo !== "object") return "Missing seo";
  return null;
}

/**
 * Resolves a site asset path (/_next/..., /photo.jpg, /uploads/...) against the
 * built output first and the source public/ folder second.
 */
async function serveSiteAsset(res, urlPath) {
  if (await serveStatic(res, outDir, urlPath, { fallbackIndex: false })) return true;
  if (await serveStatic(res, publicAssetsDir, urlPath, { fallbackIndex: false })) return true;
  return false;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = url.pathname;

  try {
    if (pathname.startsWith("/api/")) {
      const handled = await handleApi(req, res, pathname);
      if (handled) return;
      sendJson(res, 404, { error: "Unknown endpoint" });
      return;
    }

    if (pathname === "/preview" || pathname.startsWith("/preview/")) {
      const rest = pathname.slice("/preview".length) || "/";
      if (await serveStatic(res, outDir, rest)) return;
      sendText(res, 404, "Not found - run a build first");
      return;
    }

    if (pathname === "/" || pathname === "/index.html") {
      if (await serveStatic(res, publicDir, "/index.html", { fallbackIndex: false })) return;
      sendText(res, 404, "Not found");
      return;
    }

    if (pathname === "/app.js" || pathname === "/styles.css" || pathname === "/icon.svg") {
      if (await serveStatic(res, publicDir, pathname, { fallbackIndex: false })) return;
      sendText(res, 404, "Not found");
      return;
    }

    if (await serveSiteAsset(res, pathname)) return;

    sendText(res, 404, "Not found");
  } catch (error) {
    sendJson(res, 500, { error: error.message });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`\n  Portfolio CMS running at http://${HOST}:${PORT}`);
  console.log(`  Editing content in: ${contentFile}`);
  console.log(`  Repository root:     ${rootDir}\n`);
});
