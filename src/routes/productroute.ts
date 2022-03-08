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
       const product = await Product.create(
           {
           name: req.body.name, 
           price:+req.body.price,
           description: req.body.description,
           code: +req.body.code,
           quantity:req.body.quantity
        })
       res.send({msg:"success"});
    } catch(err:any) {
        console.log(err)
        if(err.name) {
            return res.send({msg: "this product already exist. do you want update this product ? "})
        }
        res.send({msg: err});
    }

});
productRoute.put('/products', async (req: Request, res: Response) => {
    try {
        console.log("Sessionproduct",req.session)
        const admin: any  =  await Customer.findOne({raw:true, where:{ id: req.session.userId}});
        if(!admin.isAdmin) {
            throw "you cannot update product";

        }
      const product:any = await Product.findOne({raw: true, where: {
          name: req.body.name
      }})
      let newquantity: number = +req.body.quantity
      const updatedProduct = await Product.update({
          code: req.body.code || product.code,
          price: req.body.price || product.price,
          quantity: req.body.quantity ? newquantity += product.quantity:product.quantity,
          description: req.body.description

       }, {
        where: {
          name: req.body.name
        }
      });
       res.send({msg:"success"});
    } catch(err:any) {
        console.log(err)
        if(err.name) {
            return res.send({msg: err.errors[0].message})
        }
        res.send({msg: err});
    }

});
productRoute.delete('/products', async (req: Request, res: Response) => {
    try {
        console.log("Sessionproduct",req.session)
        const admin: any  =  await Customer.findOne({raw:true, where:{ id: req.session.userId}});
        if(!admin.isAdmin) {
            throw "you cannot delete product";

        }
       const product = await Product.destroy({where: {name: req.body.name}})
       console.log(product)
       res.send({msg:"success"});
    } catch(err:any) {
        console.log(err)
        res.send({msg: err});
    }

});
productRoute.get('/products', async (req: Request, res: Response) => {
    try {
       const allProducts = await Product.findAll({
        raw:true
      });
      
       console.log(allProducts)
       res.send({msg: allProducts})
    } catch(err:any) {
        console.log(err)
        res.send({msg: err});
    }

});

export default productRoute;