import type { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

type App = Hono<{ Bindings: HttpBindings }>;

export function serveStaticFiles(app: App) {
  // 使用绝对路径定位 dist/public
  // 在打包后的环境中，__dirname 是 /workspace/dist (boot.js 所在目录)
  // 所以 dist/public 就在 /workspace/dist/public
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const distPublic = path.resolve(__dirname, "public");

  console.log("[vite] Serving static files from:", distPublic);
  console.log("[vite] Current __dirname:", __dirname);

  // 检查目录是否存在
  if (!fs.existsSync(distPublic)) {
    console.error("[vite] ERROR: dist/public directory does not exist!");
    // 尝试备用路径
    const fallbackPath = path.resolve(process.cwd(), "dist/public");
    console.log("[vite] Trying fallback path:", fallbackPath);
    if (fs.existsSync(fallbackPath)) {
      console.log("[vite] Fallback path exists!");
    }
    // 列出当前目录内容帮助调试
    try {
      if (fs.existsSync(__dirname)) {
        console.log("[vite] Contents of __dirname:", fs.readdirSync(__dirname));
      }
      const workspaceDir = path.resolve(__dirname, "..");
      if (fs.existsSync(workspaceDir)) {
        console.log("[vite] Contents of workspace:", fs.readdirSync(workspaceDir));
      }
    } catch (e) {
      console.error("[vite] Failed to list directory:", e);
    }
  } else {
    console.log("[vite] dist/public contents:", fs.readdirSync(distPublic));
  }

  // 先尝试精确匹配静态文件 - 使用绝对路径
  app.use("*", serveStatic({ root: distPublic }));

  // 其他所有非API请求返回index.html（SPA支持）
  app.notFound((c) => {
    const url = new URL(c.req.url);
    
    // API请求不处理
    if (url.pathname.startsWith("/api/")) {
      return c.json({ error: "Not Found" }, 404);
    }

    // 尝试返回index.html
    const indexPath = path.join(distPublic, "index.html");
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath, "utf-8");
      return c.html(content);
    }

    return c.json({ error: "Not Found" }, 404);
  });
}
