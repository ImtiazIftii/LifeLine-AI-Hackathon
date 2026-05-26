import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const children = [];
let shuttingDown = false;

function start(name, directory, args) {
  const child = spawn(process.execPath, args, {
    cwd: fileURLToPath(new URL(`../${directory}/`, import.meta.url)),
    stdio: "inherit",
    shell: false
  });
  children.push(child);
  child.on("exit", (code) => {
    if (shuttingDown) return;
    if (code !== 0) {
      console.error(`[${name}] exited with code ${code}. Stopping development services.`);
      shutdown(code || 1);
    }
  });
}

function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) child.kill("SIGTERM");
  }
  setTimeout(() => process.exit(exitCode), 150);
}

console.log("Starting LifeLine AI frontend and backend development servers...");
console.log("Frontend: http://localhost:3000 | API: http://localhost:4000");
start("backend", "backend", ["--watch", "src/server.js"]);
start("frontend", "frontend", ["node_modules/next/dist/bin/next", "dev"]);

process.on("SIGINT", () => shutdown());
process.on("SIGTERM", () => shutdown());
