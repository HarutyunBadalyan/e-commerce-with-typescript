import express, { Request,Response,NextFunction,} from "express";

import { Customer, db, CustomerBalanceslogs, Product } from "../database/models";

import { SendMail } from "../helpers/sendmail";

const buyProductRoute = express.Router();

buyProductRoute.post("/buyproduct", async (req: Request, res: Response) => {
   
    let promiseArray:Promise<any>[] = []
    let transaction:any;
    try {
        if(!req.session.userId) {
            throw "you can't buy"
        }
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
    const senderBalanceChange = await CustomerBalanceslogs.create({
        balanceChange:-buyedProductTotalSum,
        userId: req.session.userId
    
    },{transaction})
    console.log("sender",senderBalanceChange)
    const getterBalanceChange = await CustomerBalanceslogs.create({
        balanceChange:buyedProductTotalSum,
        userId: 6,
    },{transaction})
    console.log("sender",getterBalanceChange)
    const [totalsum, metadata] = await db.sequelize.query(`SELECT SUM("balanceChange") FROM public."CustomerBalanceslogs" where "userId" = ${req.session.userId};`);
    console.log(totalsum, buyedProductTotalSum)
    if(totalsum[0].sum < buyedProductTotalSum) {
        throw "not enought money";
    }
    console.log(totalsum)
    
    for( let i = 0; i < products.length; i++){
        
        promiseArray.push(Product.update({quantity: products[i].quantity - Number(req.body.products[req.body.products.findIndex((elem:any) => elem.name ===  products[i].name)].quantity)}, {where:{ name: products[i].name},transaction }))
      
    }
    const responseOfUpdateProducts = await Promise.all(promiseArray);
    const customer:any = await Customer.findOne({raw:true, where:{ id: req.session.userId}})
    await transaction.commit();
    console.log(buyedProductTotalSum)
    let arr = products.map((item:any) => {
        if(req.body.products[req.body.products.findIndex((elem:any) => elem.name ===  item.name)]) {
            return {price: item.price, quantity:req.body.products[req.body.products.findIndex((elem:any) => elem.name ===  item.name)].quantity, name:item.name }
        }
    })
    await SendMail.sendEmail(customer.email,"buyedProducts","",`<pre>${JSON.stringify(arr)} totalsum ${buyedProductTotalSum}</pre>` )
    res.send({msg: "success"});
    } catch(err: any) { 
        console.log(err);
        if(transaction) {
            await transaction.rollback();
         }
        res.send({msg: err})
    }
})
export default buyProductRoute;