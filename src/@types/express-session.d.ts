// import session from 'express-session';

// declare module 'express-session' {
//   export interface Session {
//     userId:  string
//   }
// }
import {Session} from 'express-session'

declare module 'express-session' {
 export interface SessionData {
    userId: number;
  }
}