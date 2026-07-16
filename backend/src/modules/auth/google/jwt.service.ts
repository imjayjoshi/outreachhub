import jwt from "jsonwebtoken";

export interface JwtPayload {
  id: string;
  email: string;
  name?: string | null;
}

export class JwtService {
  private secret: string;
  private expiresIn: string;

  constructor() {
    this.secret =
      process.env.JWT_SECRET ||
      process.env.AUTH_SECRET ||
      "default_auth_secret_key_123";
    this.expiresIn = "7d";
  }

  /**
   * Generates an application-level JWT token.
   */
  public generateToken(payload: JwtPayload): string {
    return jwt.sign({ ...payload }, this.secret, {
      expiresIn: "7d",
    });
  }

  /**
   * Verifies an application-level JWT token.
   */
  public verifyToken(token: string): JwtPayload {
    return jwt.verify(token, this.secret) as JwtPayload;
  }
}
