import jwtEncode from "jwt-encode";
import jwtDecode from "jwt-decode";
import { BehaviorSubject, Observable } from "rxjs";
import { Environment } from "../env/Environment";

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

  constructor(reference: string) {
    const data = {
      user: reference,
      mandator: Environment.mandator.reference,
    };

    this.accessToken = jwtEncode(data, Environment.api.jwtSecret);
    const jwt: JWT = jwtDecode(this.accessToken);
    this.expires = new Date(jwt.exp * 1000);
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

  public updateSession(reference: string): void {
    this.session$.next(new Session(reference));
  }

  public deleteSession(): void {
    this.session$.next(undefined);
  }
}

const AuthService = new AuthServiceClass();
export default AuthService;
