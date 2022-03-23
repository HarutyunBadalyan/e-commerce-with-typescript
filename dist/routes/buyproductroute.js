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
const stripe_1 = __importDefault(require("stripe"));
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: '2020-08-27',
});
const sendmail_1 = require("../helpers/sendmail");
const buyProductRoute = express_1.default.Router();
buyProductRoute.get("/buyproduct", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session.userId) {
        return res.redirect("/login");
    }
    const customer = yield models_1.Customer.findOne({ raw: true, where: { id: req.session.userId } });
    const { firstName, lastName, email } = customer;
    res.send({ firstName, lastName, email });
}));
buyProductRoute.post("/buyproduct", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let promiseArray = [];
    let transaction;
    try {
        if (!req.session.userId) {
            throw "you can't buy";
        }
        if (!req.body.cardNumber || !req.body.cardExpMonth || !req.body.cardExpYear || !req.body.cardCVC) {
            return res.status(400).send({
                Error: "Necessary Card Details are required for One Time Payment",
            });
        }
        const cardToken = yield stripe.tokens.create({
            card: {
                number: req.body.cardNumber,
                exp_month: req.body.cardExpMonth,
                exp_year: req.body.cardExpYear,
                cvc: req.body.cardCVC,
                address_state: req.body.country,
                address_zip: req.body.postalCode,
            },
        });
        let sum = 0;
        const products = yield models_1.Product.findAll({
            raw: true,
            where: {
                name: req.body.products.map((item) => item.name)
            }
        });
        products.forEach((item) => {
            sum += Number(item.price) * Number(req.body.products[req.body.products.findIndex((elem) => elem.name === item.name)].quantity);
        });
        transaction = yield models_1.db.sequelize.transaction();
        console.log("sum products", sum);
        const buyedProductTotalSum = sum;
        const customer = yield models_1.Customer.findOne({ raw: true, where: { id: req.session.userId } });
        for (let i = 0; i < products.length; i++) {
            promiseArray.push(models_1.Product.update({ quantity: products[i].quantity - Number(req.body.products[req.body.products.findIndex((elem) => elem.name === products[i].name)].quantity) }, { where: { name: products[i].name }, transaction }));
        }
        const responseOfUpdateProducts = yield Promise.all(promiseArray);
        console.log(buyedProductTotalSum);
        let arr = products.map((item) => {
            if (req.body.products[req.body.products.findIndex((elem) => elem.name === item.name)]) {
                return { price: item.price, quantity: req.body.products[req.body.products.findIndex((elem) => elem.name === item.name)].quantity, name: item.name };
            }
        });
        const charge = yield stripe.charges.create({
            amount: buyedProductTotalSum * 100,
            currency: "usd",
            source: cardToken.id,
            receipt_email: customer.email,
            description: `Stripe Charge Of Amount ${buyedProductTotalSum}  ${JSON.stringify(arr)}for One Time Payment`,
        });
        yield transaction.commit();
        yield sendmail_1.SendMail.sendEmail(customer.email, "buyedProducts", "", `<pre>${JSON.stringify(arr)} totalsum ${buyedProductTotalSum}</pre>`);
        res.send({ msg: "success" });
    }
    catch (err) {
        console.log(err);
        if (transaction) {
            yield transaction.rollback();
        }
        if (err.type === "StripeCardError") {
            return res.send({ msg: err.raw.decline_code });
        }
        res.send({ msg: err });
    }
}));
exports.default = buyProductRoute;
