import express, { Request,Response,NextFunction,} from "express";
import { Product,Customer } from "../database/models";

const productRoute = express.Router();



productRoute.post('/products', async (req: Request, res: Response) => {
    try {
        console.log("Sessionproduct",req.session)
        const admin: any  =  await Customer.findOne({raw:true, where:{ id: req.session.userId}});
        if(!admin.isAdmin) {
            throw "you cannot add product";

        }
       const product = await Product.create({name: req.body.name, price:+req.body.price, description: req.body.description })
       res.send("success");
    } catch(err:any) {
        console.log(err)
        res.send({msg: err});
    }

});

export default productRoute;