import express, { Request,Response,NextFunction,} from "express";

import { Customer, db, Product } from "../database/models";
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "",{
    apiVersion: '2020-08-27',
  });
import { SendMail } from "../helpers/sendmail";

const buyProductRoute = express.Router();
buyProductRoute.get("/buyproduct", async (req:Request, res:Response) => {
    if(!req.session.userId) {
       return res.redirect("/login");
    }
    const customer:any = await Customer.findOne({raw:true, where:{id:req.session.userId}});
      const {firstName, lastName, email} = customer;
      res.send({firstName, lastName, email});
})
buyProductRoute.post("/buyproduct", async (req: Request, res: Response) => {
   
    let promiseArray:Promise<any>[] = []
    let transaction:any;
    try {
        if(!req.session.userId) {
            throw "you can't buy"
        }
        if (!req.body.cardNumber || !req.body.cardExpMonth || !req.body.cardExpYear || !req.body.cardCVC) {
            return res.status(400).send({
              Error: "Necessary Card Details are required for One Time Payment",
            });
          }
        const cardToken = await stripe.tokens.create({
            card: {
              number: req.body.cardNumber ,
              exp_month: req.body.cardExpMonth ,
              exp_year: req.body.cardExpYear ,
              cvc: req.body.cardCVC ,
              address_state: req.body.country ,
              address_zip: req.body.postalCode ,
            },
          });
            
        let sum:number = 0;
        const products:any = await  Product.findAll({
            raw:true,
            where: {
              name: req.body.products.map((item:any) => item.name )
            }
          })
          products.forEach( (item:any) => {
              sum += Number(item.price) * Number(req.body.products[req.body.products.findIndex((elem:any) => elem.name === item.name)].quantity)
          })
    transaction = await db.sequelize.transaction();
    console.log("sum products",sum)
    const buyedProductTotalSum: number = sum;
    const customer:any = await Customer.findOne({raw:true, where:{ id: req.session.userId}})

    
    
    for( let i = 0; i < products.length; i++){
        
        promiseArray.push(Product.update({quantity: products[i].quantity - Number(req.body.products[req.body.products.findIndex((elem:any) => elem.name ===  products[i].name)].quantity)}, {where:{ name: products[i].name},transaction }))
      
    }
    const responseOfUpdateProducts = await Promise.all(promiseArray);
   
    
    console.log(buyedProductTotalSum)
    let arr = products.map((item:any) => {
        if(req.body.products[req.body.products.findIndex((elem:any) => elem.name ===  item.name)]) {
            return {price: item.price, quantity:req.body.products[req.body.products.findIndex((elem:any) => elem.name ===  item.name)].quantity, name:item.name }
        }
    })
    const charge = await stripe.charges.create({
        amount: buyedProductTotalSum * 100,
        currency: "usd",
        source: cardToken.id,
        receipt_email: customer.email,
        description: `Stripe Charge Of Amount ${buyedProductTotalSum}  ${JSON.stringify(arr)}for One Time Payment`,
      });
      await transaction.commit();
    await SendMail.sendEmail(customer.email,"buyedProducts","",`<pre>${JSON.stringify(arr)} totalsum ${buyedProductTotalSum}</pre>` )
    res.send({msg: "success"});
    } catch(err: any) { 
        console.log(err);
        if(transaction) {
            await transaction.rollback();
         }
         if(err.type === "StripeCardError") {
             return res.send({msg:err.raw.decline_code})
         }
        res.send({msg: err})
    }
})
export default buyProductRoute;