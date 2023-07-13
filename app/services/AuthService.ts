import jwtDecode from "jwt-decode";
import { Observable, ReplaySubject } from "rxjs";
import StorageService from "./StorageService";

const SessionKey = "session";

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

  constructor(session?: ISession) {
    this.accessToken = session?.accessToken;
    if (this.accessToken) {
      const jwt: JWT = jwtDecode(this.accessToken);
      this.expires = new Date(jwt.exp * 1000);
    }
  }
}

class AuthServiceClass {
  private session$ = new ReplaySubject<Session>();

  constructor() {
    this.Session.then((session) => this.session$.next(session)).catch(() => this.session$.next(new Session()));
  }

  public get Session$(): Observable<Session> {
    return this.session$;
  }

  public get Session(): Promise<Session> {
    return StorageService.getValue<ISession>(SessionKey).then((session) => new Session(session));
  }

  public updateSession(session: ISession): Promise<void> {
    return StorageService.storeValue(SessionKey, session).then(() => this.session$.next(new Session(session)));
  }

  public deleteSession(): Promise<void> {
    return this.updateSession({
      accessToken: undefined,
    });
  }
}

const AuthService = new AuthServiceClass();
export default AuthService;
