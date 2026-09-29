import http from "node:http";
import fs from "node:fs/promises";
import { createReadStream } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../dist/", import.meta.url));
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".wav": "audio/wav",
  ".woff2": "font/woff2",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
};
export function createPreviewServer({ prefix = "/" } = {}) {
  return http.createServer(async (req, res) => {
    try {
      if (!["GET", "HEAD"].includes(req.method)) {
        res.writeHead(405, { Allow: "GET, HEAD" });
        return res.end();
      }
      const url = new URL(req.url, "http://localhost");
      const pathname = decodeURIComponent(url.pathname);
      if (!pathname.startsWith(prefix)) {
        res.writeHead(404);
        return res.end();
      }
      const relative = pathname.slice(prefix.length);
      let file = path.resolve(root, relative || ".");
      if (file !== path.resolve(root) && !file.startsWith(root)) {
        res.writeHead(403);
        return res.end();
      }
      if ((await fs.stat(file)).isDirectory()) {
        if (!pathname.endsWith("/")) {
          res.writeHead(308, { Location: url.pathname + "/" + url.search });
          return res.end();
        }
        file = path.join(file, "index.html");
      }
      if (!(await fs.realpath(file)).startsWith(root)) {
        res.writeHead(403);
        return res.end();
      }
      const { size } = await fs.stat(file);
      let start = 0,
        end = size - 1,
        status = 200;
      if (req.headers.range) {
        const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
        if (range) {
          start = range[1]
            ? Number(range[1])
            : Math.max(0, size - Number(range[2]));
          end =
            range[1] && range[2]
              ? Math.min(size - 1, Number(range[2]))
              : size - 1;
        }
        if (
          !range ||
          (!range[1] && !range[2]) ||
          start > end ||
          start >= size
        ) {
          res.writeHead(416, { "Content-Range": `bytes */${size}` });
          return res.end();
        }
        status = 206;
      }
      res.writeHead(status, {
        "Content-Type": types[path.extname(file)] || "application/octet-stream",
        "Content-Length": Math.max(0, end - start + 1),
        "Accept-Ranges": "bytes",
        "X-Content-Type-Options": "nosniff",
        ...(status === 206
          ? { "Content-Range": `bytes ${start}-${end}/${size}` }
          : {}),
      });
      if (req.method === "HEAD" || size === 0) return res.end();
      const stream = createReadStream(file, { start, end });
      stream.on("error", () => res.destroy());
      res.on("close", () => stream.destroy());
      stream.pipe(res);
    } catch (error) {
      if (!res.headersSent)
        res.writeHead(
          error instanceof URIError ? 400 : error.code === "ENOENT" ? 404 : 500,
        );
      res.end();
    }
  });
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 4173);
  createPreviewServer().listen(port, "127.0.0.1", () =>
    console.log(`PDF Listener website: http://127.0.0.1:${port}`),
  );
}
