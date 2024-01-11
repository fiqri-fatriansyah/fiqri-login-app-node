import express from "express";
import prisma from "../prisma/prisma";
import bcrypt from "bcrypt";

const router = express.Router();

router.post("/", async (req, res) => {
    const { username, password, nama } = req.body;

    //asynchronous
    try {
        const saltRounds = 10;
        const hash = await bcrypt.hash(password, saltRounds);

        //console.log("password:", password);
        //console.log("hash:", hash);
        
        const user = await prisma.UsersFiqri.create({
            data: {
                "username": username,
                "password": hash,
                "nama": nama,
            },
        });


        if (user && user.id) {
            res.status(201).json({ message: "Berhasil menambah user", result: user });
            return;
        }

        res.status(400).json({ message: "Gagal menambah user" });
    } catch (err) {
        console.log({ err });
        res.status(500).json({ message: "Internal server error:", error });
    }
});

router.get("/", (req, res) => {
    prisma.UsersFiqri
    .findMany({
        select: {
            id: true,
            username: true,
            password: true,
            nama: true,
        },
    })
    .then((users) => 
        res.status(200).json({ results: users })
    )
    .catch((err) => {
        console.log({ err });
        res.status(500).json({ message: "Internal server error", err });
    });
});

router.get("/:userid", (req, res) => {
    prisma.UsersFiqri
    .findUnique({
        where: {
            id: req.params.userid
        },
    })
    .then((user) => 
        res.status(200).json({ results: user })
    )
    .catch((err) => {
        console.log({ err });
        res.status(500).json({ message: "Internal server error", err });
    });
});

router.put("/:userid", async (req, res) => {
    try {
        const isExist = await prisma.UsersFiqri.findUnique({
            where: {
                id: req.params.userid,
            },
        });
        
        if(!isExist) {
            res.status(404).json({ message: "User tidak ditemukan" });
            return;
        }

        const doUpdate = await prisma.UsersFiqri.update({
            where: {
                id: req.params.userid,
            },
            data: {
                username: req.body.username,
                password: req.body.password,
                nama: req.body.nama,
            },
            select: {
                id: true,
                username: true,
                password: true,
                nama: true,
            },
        });

        res.status(200).json({
            message: "User berhasil di update",
            result: doUpdate,
        });
    }
    catch(err) {
        console.log({ err });
        res.status(500).json({ message: "Internal server error", err });
    }
});

router.delete("/:userid", async (req, res) => {
    try {
        const isExist = await prisma.UsersFiqri.findUnique({
            where: { id: req.params.userid },
        });

        if(!isExist) {
            res.status(404).json({ message: "User tidak ditemukan" });
            return;
        }

        const doDelete = await prisma.UsersFiqri.delete({
            where: { id: req.params.userid },
        });

        res.status(200).json({
            message: "Data user berhasil dihapus",
            result: doDelete,
        });
    }
    catch(err) {
        console.log({ err });
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;