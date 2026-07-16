export class Logger {
  /**
   * Sanitizes strings to prevent sensitive credentials leaking into log storage.
   */
  private static sanitize(message: string): string {
    let sanitized = message;
    const sensitiveRegexes = [
      /(client_secret|clientSecret|secret|password|token|jwt|refresh_token|refreshToken|access_token|accessToken)=["']?[a-zA-Z0-9_\-\.\/:\?&@#%=]+["']?/gi,
      /(GOCSPX-[a-zA-Z0-9_\-]+)/g, // Google OAuth Client Secret pattern
    ];
    for (const regex of sensitiveRegexes) {
      sanitized = sanitized.replace(regex, (match) => {
        const parts = match.split("=");
        if (parts.length > 1) {
          return `${parts[0]}=[REDACTED]`;
        }
        return "[REDACTED_SECRET]";
      });
    }
    return sanitized;
  }

  public static info(message: string, ...args: any[]) {
    console.log(
      `[INFO] ${this.sanitize(message)}`,
      ...args.map((a) => (typeof a === "string" ? this.sanitize(a) : a)),
    );
  }

  public static error(message: string, error?: any, ...args: any[]) {
    console.error(
      `[ERROR] ${this.sanitize(message)}`,
      error,
      ...args.map((a) => (typeof a === "string" ? this.sanitize(a) : a)),
    );
  }

  public static warn(message: string, ...args: any[]) {
    console.warn(
      `[WARN] ${this.sanitize(message)}`,
      ...args.map((a) => (typeof a === "string" ? this.sanitize(a) : a)),
    );
  }
}
