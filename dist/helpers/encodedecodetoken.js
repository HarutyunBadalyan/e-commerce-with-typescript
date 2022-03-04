"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenEncodeDecode = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const privateKey = "secret";
class TokenEncodeDecode {
    static encodeToken(data, time) {
        const token = jsonwebtoken_1.default.sign({ data: data }, privateKey, { expiresIn: time || 3600 });
        return token;
    }
    static decodeToken(token) {
        const decoded = jsonwebtoken_1.default.verify(token, privateKey);
        return decoded;
    }
}
exports.TokenEncodeDecode = TokenEncodeDecode;
