"use strict";
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
const url_1 = __importDefault(require("url"));
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const registervalidationmiddlewares_1 = __importDefault(require("../middlewares/registervalidationmiddlewares"));
const hashandcomparepassword_1 = require("../helpers/hashandcomparepassword");
const models_1 = require("../database/models");
const sendmail_1 = require("../helpers/sendmail");
const encodedecodetoken_1 = require("../helpers/encodedecodetoken");
const registerRoute = express_1.default.Router();
registerRoute.post('/register', registervalidationmiddlewares_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            throw errors;
        }
        const token = encodedecodetoken_1.TokenEncodeDecode.encodeToken(req.body.email);
        const hashedPassword = yield hashandcomparepassword_1.HashAndComparePassword.hashPassword(req.body.password);
        const customer = yield models_1.Customer.create({
            email: req.body.email,
            password: hashedPassword,
            firstName: req.body.firstName,
            lastName: req.body.lastName
        });
        console.log(customer);
        const sentemail = yield sendmail_1.SendMail.sendEmail(req.body.email, "authentication message", "dsfsdf", `<a href="${url_1.default.resolve(process.env.BASEURL || "http://localhost:3000/", `/token/${token}`)}">click for authentication<a>`);
        //console.log("asdasd",sentemail)
        res.send({ msg: "success" });
    }
    catch (err) {
        console.log("errors register", err);
        if (!err.name) {
            return res.send({ msg: err.errors.map((item) => item.msg) }); //sending error array or string
        }
        return res.send({ msg: "Please use another email" });
    }
}));
exports.default = registerRoute;
