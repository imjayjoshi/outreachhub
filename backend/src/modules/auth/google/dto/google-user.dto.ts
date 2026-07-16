export class GoogleUserDto {
  public readonly googleId: string;
  public readonly email: string;
  public readonly name: string | null;
  public readonly avatar: string | null;
  public readonly provider: string;
  public readonly providerId: string;

  constructor(data: {
    googleId: string;
    email: string;
    name: string | null;
    avatar: string | null;
    provider: string;
    providerId: string;
  }) {
    this.googleId = data.googleId;
    this.email = data.email;
    this.name = data.name;
    this.avatar = data.avatar;
    this.provider = data.provider;
    this.providerId = data.providerId;
  }
}
