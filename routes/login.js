import express from "express";
import jwt from "jsonwebtoken";
import prisma from "../prisma/prisma";

//import "dotenv/config";

const router = express.Router();

router.post("/", (req, res) => {
    prisma.Users.findMany({
        where: {
            username: req.body.username,
            password: req.body.password
        }
    })
    .then((data) => {
        console.log(data);
        if(data.length == 0) {
            res.status(401).json({ message: "Username atau Password salah! Ketik yang bener." });
        }
        else {
            const token = jwt.sign(
                {
                    id: data.id,
                    username: data.username,
                    nama: data.nama
                },
                process.env.JWT_SECRET,
                { expiresIn: '5m'});
        
            res.status(200).json({ token });
        }
    })

})

export default router;