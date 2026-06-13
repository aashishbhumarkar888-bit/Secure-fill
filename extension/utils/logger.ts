/**
 * Logger Utility
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export class Logger {
  private static minLevel = LogLevel.INFO;

  static setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  static debug(message: string, data?: unknown): void {
    if (this.minLevel <= LogLevel.DEBUG) {
      console.log(`[SecureFill Debug] ${message}`, data);
    }
  }

  static info(message: string, data?: unknown): void {
    if (this.minLevel <= LogLevel.INFO) {
      console.log(`[SecureFill Info] ${message}`, data);
    }
  }

  static warn(message: string, data?: unknown): void {
    if (this.minLevel <= LogLevel.WARN) {
      console.warn(`[SecureFill Warn] ${message}`, data);
    }
  }

  static error(message: string, error?: unknown): void {
    if (this.minLevel <= LogLevel.ERROR) {
      console.error(`[SecureFill Error] ${message}`, error);
    }
  }
}
