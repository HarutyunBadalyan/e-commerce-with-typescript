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
const express_1 = __importDefault(require("express"));
const loginvalidationmiddlewares_1 = __importDefault(require("../middlewares/loginvalidationmiddlewares"));
const express_validator_1 = require("express-validator");
const models_1 = require("../database/models");
const hashandcomparepassword_1 = require("../helpers/hashandcomparepassword");
const loginRoute = express_1.default.Router();
loginRoute.get("/login", loginvalidationmiddlewares_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.session);
    if (req.session.userId) {
        return res.redirect("/profile");
    }
    res.send({ msg: "success" }); // or next() if using react;
}));
loginRoute.post("/login", loginvalidationmiddlewares_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            throw errors;
        }
        const customer = yield models_1.Customer.findOne({ raw: true, where: { email: req.body.email } });
        console.log(customer);
        if (!customer) {
            throw "Invalid email or password";
        }
        const match = yield hashandcomparepassword_1.HashAndComparePassword.comparePassword(req.body.password, customer.password);
        req.session.userId = customer.id;
        console.log("Session", req.session);
        res.send({ msg: "success" });
    }
    catch (err) {
        if (Array.isArray(err.errors)) {
            return res.send({ msg: err });
        }
        return res.send({ msg: err });
    }
}));
exports.default = loginRoute;
