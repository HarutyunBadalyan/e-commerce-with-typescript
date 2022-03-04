import jwt from 'jsonwebtoken';
const privateKey =   "secret";
class TokenEncodeDecode {
    static encodeToken  (data:string, time?:number)  {
        const token = jwt.sign({ data:data }, privateKey, {  expiresIn: time || 3600});
        return token;
    }
    static decodeToken  (token:string) {
        const decoded = jwt.verify(token, privateKey);
        return decoded;
    }
}
export {TokenEncodeDecode};