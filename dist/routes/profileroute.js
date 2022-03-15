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
const models_1 = require("../database/models");
const profileRouter = express_1.default.Router();
profileRouter.get("/profile", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session.userId) {
        return res.redirect("/login");
    }
    const customer = yield models_1.Customer.findOne({ raw: true, where: { id: req.session.userId } });
    const { firstName, lastName, email } = customer;
    res.send({ firstName, lastName, email });
}));
exports.default = profileRouter;
