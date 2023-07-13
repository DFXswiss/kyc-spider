import jwtDecode from "jwt-decode";
import { BehaviorSubject, Observable, ReplaySubject } from "rxjs";

export interface ISession {
  accessToken?: string;
}

interface JWT {
  exp: number;
  iat: number;
  mandator: string;
  user: string;
}

export class Session implements ISession {
  public accessToken?: string;
  public expires?: Date;

  public get isLoggedIn(): boolean {
    return Boolean(this.accessToken);
  }

  public get isExpired(): boolean {
    return this.expires != null && !(Date.now() < this.expires.getTime());
  }

  constructor(reference?: string) {
    // TODO: generate access token, if reference is there
    this.accessToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtYW5kYXRvciI6IkE4RUMxQUMyLUI3MjEtRUUxMS1BOUJCLTAwMEQzQTQ4MTRDNyIsInVzZXIiOiJ1c2VyLTEiLCJpYXQiOjE2ODkyNzg0NTIsImV4cCI6MTY4OTQ1MTI1Mn0.PrX_-fB9sr8wSMS93tX62A1WyCGx4XLZsv9fSjIk-Do";

    if (this.accessToken) {
      const jwt: JWT = jwtDecode(this.accessToken);
      this.expires = new Date(jwt.exp * 1000);
    }
  }
}

class AuthServiceClass {
  private session$ = new BehaviorSubject<Session | undefined>(undefined);

  public get Session(): Session | undefined {
    return this.session$.value;
  }

  public get Session$(): Observable<Session | undefined> {
    return this.session$;
  }

  public updateSession(reference?: string): void {
    this.session$.next(new Session(reference));
  }

  public deleteSession(): void {
    this.updateSession(undefined);
  }
}

const AuthService = new AuthServiceClass();
export default AuthService;
