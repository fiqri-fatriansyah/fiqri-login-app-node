import express from "express";
import jwt from "jsonwebtoken";
import prisma from "../prisma/prisma";
import bcrypt from "bcrypt";

//import "dotenv/config";

const router = express.Router();

router.post("/", (req, res) => {
    try{
        prisma.UsersFiqri.findMany({
            where: {
                username: req.body.username,
            }
        })
        .then((data) => {
            console.log("DATA:", data[0]);
            if(data.length == 0) {
                res.status(401).json({ message: "Username salah! Ketik yang bener." });
            }
            else {
                const result = bcrypt.compareSync(req.body.password, data[0].password);
                console.log("RESULT:", result);
                if(result) {
                    const token = jwt.sign(
                        {
                            id: data[0].id,
                            username: data[0].username,
                            nama: data[0].nama
                        },
                        process.env.JWT_SECRET,
                        { expiresIn: '5m'});
                
                    res.status(200).json({ token });
                }
                else {
                    res.status(401).json({ message: "Password salah! Ketik yang bener." });
                }
            }
        })
    }
    catch(err) {   
        console.log({ err });
        res.status(500).json( { message: "Internal server error:", err });
    }
})

export default router;