/* eslint-disable max-classes-per-file */
import chalk from 'chalk';
import env, { logLevels, type LogLevel } from './env';
import type { MiddlewareHandler } from 'hono';

interface ServerLoggerConfig {
  showTimestamp: boolean;
  showLevelLabel: boolean;
  logLevel: LogLevel;
  showColoredOutput: boolean;
}

interface ServerLogger {
  setLogLevel(level: LogLevel): void;
  getLogLevel(): LogLevel;
  setShowTimestamp(show: boolean): void;
  getShowTimestamp(): boolean;
  setShowLevelLabel(show: boolean): void;
  getShowLevelLabel(): boolean;
  setShowColoredOutput(show: boolean): void;
  getShowColoredOutput(): boolean;
  log(...args: Parameters<typeof console.log>): void;
  info(...args: Parameters<typeof console.info>): void;
  warn(...args: Parameters<typeof console.warn>): void;
  error(...args: Parameters<typeof console.error>): void;
  debug(...args: Parameters<typeof console.debug>): void;
}

/**
 * Don't use in the client environment as chalk does not work for the browser's console output.
 */
class ServerImpl implements ServerLogger {
  protected logLevel: LogLevel;
  protected showTimestamp: boolean;
  protected showLevelLabel: boolean;
  protected showColoredOutput: boolean;

  constructor(config: ServerLoggerConfig) {
    this.showTimestamp = config.showTimestamp;
    this.showLevelLabel = config.showLevelLabel;
    this.logLevel = config.logLevel;
    this.showColoredOutput = config.showColoredOutput;
  }

  public getLogLevel(): LogLevel {
    return this.logLevel;
  }
  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  public getShowTimestamp(): boolean {
    return this.showTimestamp;
  }
  public setShowTimestamp(show: boolean): void {
    this.showTimestamp = show;
  }

  public getShowLevelLabel(): boolean {
    return this.showLevelLabel;
  }
  public setShowLevelLabel(show: boolean): void {
    this.showLevelLabel = show;
  }

  public getShowColoredOutput(): boolean {
    return this.showColoredOutput;
  }
  public setShowColoredOutput(show: boolean): void {
    this.showColoredOutput = show;
  }

  protected levels = logLevels satisfies readonly LogLevel[];

  protected shouldLog(level: LogLevel): boolean {
    return this.levels.indexOf(level) >= this.levels.indexOf(this.logLevel);
  }

  protected static getTimestamp(): string {
    return new Date().toISOString();
  }

  protected logLogic(
    level: LogLevel,
    message: string,
    ...args: unknown[]
  ): void {
    if (!this.shouldLog(level)) return;

    const logParts: unknown[] = [];

    if (this.showTimestamp) {
      logParts.push(`[${ServerImpl.getTimestamp()}]`);
    }

    if (this.showLevelLabel) {
      let coloredLevel: string;
      switch (level) {
        case 'warn':
          coloredLevel = chalk.yellow(level.toUpperCase());
          break;
        case 'error':
          coloredLevel = chalk.red(level.toUpperCase());
          break;
        case 'debug':
          coloredLevel = chalk.green(level.toUpperCase());
          break;
        case 'info':
        case 'log':
        default:
          coloredLevel = chalk.blue(level.toUpperCase());
          break;
      }

      logParts.push(`${coloredLevel}:`);
    }

    let coloredMessage = message;
    if (this.showColoredOutput) {
      // Only import chalk in server environment
      switch (level) {
        case 'warn':
          coloredMessage = chalk.yellow(message);
          break;
        case 'error':
          coloredMessage = chalk.red(message);
          break;
        case 'debug':
          coloredMessage = chalk.green(message);
          break;
        case 'info':
        case 'log':
        default:
          coloredMessage = chalk.blue(message);
          break;
      }
    }

    // eslint-disable-next-line no-console
    console[level](logParts.join(' '), coloredMessage, ...args);
  }

  public log(...args: Parameters<typeof console.log>): void {
    this.logLogic('log', ...args);
  }

  public info(...args: Parameters<typeof console.info>): void {
    this.logLogic('info', ...args);
  }

  public warn(...args: Parameters<typeof console.warn>): void {
    this.logLogic('warn', ...args);
  }

  public error(...args: Parameters<typeof console.error>): void {
    this.logLogic('error', ...args);
  }

  public debug(...args: Parameters<typeof console.debug>): void {
    this.logLogic('debug', ...args);
  }
}

export const createServerLogger = (
  config: Partial<ServerLoggerConfig> = {},
): ServerLogger => {
  const actualConfig: ServerLoggerConfig = {
    logLevel: config.logLevel ?? 'info',
    showTimestamp: config.showTimestamp ?? true,
    showLevelLabel: config.showLevelLabel ?? true,
    showColoredOutput: config.showColoredOutput ?? true,
  };

  const serverLogger = new ServerImpl(actualConfig) as ServerLogger;
  return serverLogger;
};

/**
 * Holds the singleton instance of the server logger.
 */
let serverLoggerInstance: ReturnType<typeof createServerLogger>;

/**
 * Returns the singleton instance of the server logger.
 * If the instance doesn't exist, it creates one with default configuration.
 *
 * @returns {ServerLogger} The singleton server logger instance.
 */
export const getServerLogger = (): ReturnType<typeof createServerLogger> => {
  if (!serverLoggerInstance) {
    serverLoggerInstance = createServerLogger({
      showTimestamp: true,
      showLevelLabel: false,
      showColoredOutput: true,
      logLevel: env.LOG_LEVEL,
    });
  }

  return serverLoggerInstance;
};

/**
 * The singleton instance of the server logger.
 * This is created on the first import of this module.
 */
export const logger = getServerLogger();

/**
 * Middleware to log incoming requests.
 *
 * Includes method, path, and query parameters.
 */
export const logRequestsMiddleware: MiddlewareHandler = async (c, next) => {
  let message = `[${c.req.method}] ${c.req.path}`;
  const queryParamsAsSingleArrayOfStrings: string[] = [];
  const queryParams = c.req.queries();
  if (Object.keys(queryParams).length > 0) {
    for (const [key, value] of Object.entries(queryParams)) {
      for (const v of value) {
        queryParamsAsSingleArrayOfStrings.push(`${key}=${v}`);
      }
    }
  }

  if (queryParamsAsSingleArrayOfStrings.length > 0) {
    message += `?${queryParamsAsSingleArrayOfStrings.join('&')}`;
  }
  logger.debug(message);
  return await next();
};
