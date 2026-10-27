// Tiny structured (JSON-lines) logger. No extra dependency.
// LOG_LEVEL: error | warn | info | debug | silent (default: info)
// Never pass request bodies, tokens, passwords or medical data in `meta`.
const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };

const write = (level, message, meta = {}) => {
  const configured = (process.env.LOG_LEVEL || "info").toLowerCase();
  if (configured === "silent") return;
  if (LEVELS[level] > (LEVELS[configured] ?? LEVELS.info)) return;

  const line = JSON.stringify({
    time: new Date().toISOString(),
    level,
    message,
    ...meta,
  });

  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
};

export default {
  error: (message, meta) => write("error", message, meta),
  warn: (message, meta) => write("warn", message, meta),
  info: (message, meta) => write("info", message, meta),
  debug: (message, meta) => write("debug", message, meta),
};
