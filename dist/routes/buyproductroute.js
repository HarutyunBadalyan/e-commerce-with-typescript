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
const sendmail_1 = require("../helpers/sendmail");
const buyProductRoute = express_1.default.Router();
// Product.update({quantity: 3}, {where:{ name:"apple"}}).then(r => console.log(r)).catch(e => {
//     console.error(e)
// })
buyProductRoute.post("/buyproduct", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let transaction;
    try {
        if (!req.session.userId) {
            throw "you can't buy";
        }
        let sum = 0;
        const products = yield models_1.Product.findAll({
            raw: true,
            where: {
                name: req.body.products.map((item) => item.name)
            }
        });
        products.forEach((item) => {
            //await Product.update({quantity: item.quantity - Number(req.body.products[req.body.products.findIndex((elem:any) => elem.name === item.name)].quantity)}, {where:{ name:item.name},transaction })
            //console.log("product item",item.price, req.body.products[req.body.products.findIndex((elem:any) => elem.name === item.name)] )
            sum += Number(item.price) * Number(req.body.products[req.body.products.findIndex((elem) => elem.name === item.name)].quantity);
        });
        transaction = yield models_1.db.sequelize.transaction();
        console.log("sum products", sum);
        const buyedProductTotalSum = sum;
        const senderBalanceChange = yield models_1.CustomerBalanceslogs.create({
            balanceChange: -buyedProductTotalSum,
            userId: req.session.userId
        }, { transaction });
        console.log("sender", senderBalanceChange);
        const getterBalanceChange = yield models_1.CustomerBalanceslogs.create({
            balanceChange: buyedProductTotalSum,
            userId: 6,
        }, { transaction });
        console.log("sender", getterBalanceChange);
        const [totalsum, metadata] = yield models_1.db.sequelize.query(`SELECT SUM("balanceChange") FROM public."CustomerBalanceslogs" where "userId" = ${req.session.userId};`);
        console.log(totalsum, buyedProductTotalSum);
        if (totalsum[0].sum < buyedProductTotalSum) {
            throw "not enought money";
        }
        console.log(totalsum);
        for (let i = 0; i < products.length; i++) {
            try {
                yield models_1.Product.update({ quantity: products[i].quantity - Number(req.body.products[req.body.products.findIndex((elem) => elem.name === products[i].name)].quantity) }, { where: { name: products[i].name }, transaction });
            }
            catch (err) {
                throw err;
            }
        }
        const customer = yield models_1.Customer.findOne({ raw: true, where: { id: req.session.userId } });
        yield transaction.commit();
        console.log(buyedProductTotalSum);
        let arr = products.map((item) => {
            if (req.body.products[req.body.products.findIndex((elem) => elem.name === item.name)]) {
                return { price: item.price, quantity: req.body.products[req.body.products.findIndex((elem) => elem.name === item.name)].quantity, name: item.name };
            }
        });
        yield sendmail_1.SendMail.sendEmail(customer.email, "buyedProducts", "", `<pre>${JSON.stringify(arr)} totalsum ${buyedProductTotalSum}</pre>`);
        res.send({ msg: "success" });
    }
    catch (err) {
        console.log(err);
        if (transaction) {
            yield transaction.rollback();
        }
        res.send({ msg: err });
    }
}));
exports.default = buyProductRoute;
