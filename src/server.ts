
import * as dotenv from "dotenv";
dotenv.config()
import express, { Request,Response,NextFunction, Application } from "express";
import registerRoute from "./routes/registerroute";

import {TokenEncodeDecode} from "./helpers/encodedecodetoken"
import { Customer } from "./database/models";

const app:Application = express();


const PORT:number = Number(process.env.PORT) || 3000; 

app.use(express.json());
app.use(express.urlencoded({extended:true}));

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
})

app.use("/",registerRoute)




app.listen(PORT, () => console.log(`app listen localhost:${PORT}`));