
import * as dotenv from "dotenv";
dotenv.config()
import express, { Request,Response,NextFunction, Application } from "express";
import registerRoute from "./routes/registerroute";
import cookieParser from 'cookie-parser';
import sessions from 'express-session';

import {TokenEncodeDecode} from "./helpers/encodedecodetoken"
import { Customer } from "./database/models";
import loginRoute from "./routes/loginroute";
import productRoute from "./routes/productroute";
import buyProductRoute from "./routes/buyproductroute";
import profileRouter from "./routes/profileroute";

const app:Application = express();

const PORT:number = Number(process.env.PORT) || 3000; 

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
const oneDay = 1000 * 60 * 60 * 24;

app.use(
    sessions({
        secret: 'thisismysecrctekeyfhrgfgrfrty84fwir767',
        saveUninitialized: true,
        cookie: { maxAge: oneDay,  },
        //name: 'connectid', // name of cookie
        resave: false,
    })
);

app.get("/token/:id", async (req:Request, res:Response) => {
    try {
        const decodedData:any = TokenEncodeDecode.decodeToken(req.params.id);
        console.log(decodedData);
        const customer = await Customer.update({ authenticated: true }, {
           where: {
             email:decodedData.data,
           }
         });
         console.log(customer)
        res.send("success");
    } catch(err) {
        console.log(err);
        res.send("time expired");
    }
});

app.use("/",registerRoute);
app.use("/", loginRoute);
app.use("/", productRoute)
app.use("/", buyProductRoute);
app.use("/", profileRouter)
app.post("/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => 
    {
    if(err){
        return res.send({msg:"error"})
    } 
    return res.send({msg:"success"})
    });
})
app.listen(PORT, () => console.log(`app listen localhost:${PORT}`));