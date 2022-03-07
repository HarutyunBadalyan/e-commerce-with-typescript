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
const productRoute = express_1.default.Router();
productRoute.post('/products', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Sessionproduct", req.session);
        const admin = yield models_1.Customer.findOne({ raw: true, where: { id: req.session.userId } });
        if (!admin.isAdmin) {
            throw "you cannot add product";
        }
        const product = yield models_1.Product.create({
            name: req.body.name,
            price: +req.body.price,
            description: req.body.description,
            code: +req.body.code,
            quantity: req.body.quantity
        });
        res.send({ msg: "success" });
    }
    catch (err) {
        console.log(err);
        if (err.name) {
            return res.send({ msg: "this product already exist. do you want update this product ? " });
        }
        res.send({ msg: err });
    }
}));
productRoute.delete('/products', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Sessionproduct", req.session);
        const admin = yield models_1.Customer.findOne({ raw: true, where: { id: req.session.userId } });
        if (!admin.isAdmin) {
            throw "you cannot delete product";
        }
        const product = yield models_1.Product.destroy({ where: { name: req.body.name } });
        console.log(product);
        res.send({ msg: "success" });
    }
    catch (err) {
        console.log(err);
        res.send({ msg: err });
    }
}));
productRoute.get('/products', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allProducts = yield models_1.Product.findAll({
            raw: true
        });
        console.log(allProducts);
        res.send({ msg: allProducts });
    }
    catch (err) {
        console.log(err);
        res.send({ msg: err });
    }
}));
exports.default = productRoute;
