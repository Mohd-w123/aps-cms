const { createServer } = require("http");
const { parse } = require("url");
const fs = require("fs");
const next = require("next");

if (process.env.HOSTNAME && (process.env.HOSTNAME.startsWith("/") || process.env.HOSTNAME.includes(".sock"))) {
  process.env.HOSTNAME = "0.0.0.0";
}

const dev = false;
const app = next({ dev });
const handle = app.getRequestHandler();

// LiteSpeed and Hostinger can pass a Unix domain socket path or a TCP port in process.env.PORT
const rawPort = process.env.PORT || 3000;
const isSocket = typeof rawPort === "string" && (rawPort.startsWith("/") || rawPort.includes(".sock"));
const port = isSocket ? rawPort : (parseInt(rawPort, 10) || 3000);

// If running on a Unix socket, clean up any stale socket file first
if (isSocket && fs.existsSync(rawPort)) {
  try {
    fs.unlinkSync(rawPort);
  } catch (e) {
    console.error("Notice: Could not unlink existing socket:", e.message);
  }
}

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error handling request:", req.url, err);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  });

  server.on("error", (err) => {
    console.error("Server error:", err);
    process.exit(1);
  });

  if (isSocket) {
    server.listen(port, () => {
      console.log(`> Production server ready on Unix socket: ${port}`);
      try {
        fs.chmodSync(port, "777");
      } catch (_) {}
    });
  } else {
    server.listen(port, "0.0.0.0", () => {
      console.log(`> Production server ready on http://0.0.0.0:${port}`);
    });
  }
}).catch((err) => {
  console.error("Error preparing Next.js server:", err);
  process.exit(1);
});
