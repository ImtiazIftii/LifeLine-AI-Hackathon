import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const children = [];
let shuttingDown = false;
const isWindows = process.platform === "win32";
const npmCommand = isWindows ? process.env.ComSpec || "cmd.exe" : "npm";
const npmArgs = isWindows ? ["/d", "/s", "/c", "npm.cmd run dev"] : ["run", "dev"];

function start(name, directory, command, args) {
  const child = spawn(command, args, {
    cwd: fileURLToPath(new URL(`../${directory}/`, import.meta.url)),
    stdio: "inherit",
    shell: false
  });
  children.push(child);
  child.on("error", (error) => {
    if (shuttingDown) return;
    console.error(`[${name}] failed to start: ${error.message}`);
    shutdown(1);
  });
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
start("backend", ".", process.env.PYTHON || "python", [
  "-m",
  "uvicorn",
  "app.main:app",
  "--app-dir",
  "backend",
  "--host",
  "0.0.0.0",
  "--port",
  "4000",
  "--reload"
]);
start("frontend", "frontend", npmCommand, npmArgs);

process.on("SIGINT", () => shutdown());
process.on("SIGTERM", () => shutdown());
