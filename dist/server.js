"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const express_1 = __importDefault(require("express"));
const registerroute_1 = __importDefault(require("./routes/registerroute"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_session_1 = __importDefault(require("express-session"));
const encodedecodetoken_1 = require("./helpers/encodedecodetoken");
const models_1 = require("./database/models");
const loginroute_1 = __importDefault(require("./routes/loginroute"));
const productroute_1 = __importDefault(require("./routes/productroute"));
const buyproductroute_1 = __importDefault(require("./routes/buyproductroute"));
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 3000;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
const oneDay = 1000 * 60 * 60 * 24;
app.use((0, express_session_1.default)({
    secret: 'thisismysecrctekeyfhrgfgrfrty84fwir767',
    saveUninitialized: true,
    cookie: { maxAge: oneDay, },
    //name: 'connectid', // name of cookie
    resave: false,
}));
app.get("/token/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const decodedData = encodedecodetoken_1.TokenEncodeDecode.decodeToken(req.params.id);
        console.log(decodedData);
        const customer = yield models_1.Customer.update({ authenticated: true }, {
            where: {
                email: decodedData.data,
            }
        });
        console.log(customer);
        res.send("success");
    }
    catch (err) {
        console.log(err);
        res.send("time expired");
    }
}));
app.use("/", registerroute_1.default);
app.use("/", loginroute_1.default);
app.use("/", productroute_1.default);
app.use("/", buyproductroute_1.default);
app.listen(PORT, () => console.log(`app listen localhost:${PORT}`));
