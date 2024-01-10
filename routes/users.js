import express from "express";
import prisma from "../prisma/prisma";

const router = express.Router();

router.post("/", async (req, res) => {
    const { username, password, nama } = req.body;

    //asynchronous
    try {
        const user = await prisma.Users.create({
            data: {
                username,
                password,
                nama,
            },
        });

        if (user && user.id) {
            res.status(200).json({ message: "Berhasil menambah user", result: user });
            return;
        }

        res.status(400).json({ message: "Gagal menambah user" });
    } catch (error) {
        console.log({ error });
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/", (req, res) => {
    prisma.Users
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
        console.log("Error: ", err);
        res.status(500).json({ message: "Internal server error" });
    });
});

router.get("/:userid", (req, res) => {
    prisma.Users
    .findUnique({
        where: {
            id: req.params.userid
        },
    })
    .then((user) => 
        res.status(200).json({ results: user })
    )
    .catch((err) => {
        console.log("Error: ", err);
        res.status(500).json({ message: "Internal server error" });
    });
});

router.put("/:userid", async (req, res) => {
    try {
        const isExist = await prisma.Users.findUnique({
            where: {
                id: req.params.userid,
            },
        });
        
        if(!isExist) {
            res.status(404).json({ message: "User tidak ditemukan" });
            return;
        }

        const doUpdate = await prisma.Users.update({
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
        console.log({ error });
        res.status(500).json({ message: "Internal server error" });
    }
});

router.delete("/:userid", async (req, res) => {
    try {
        const isExist = await prisma.Users.findUnique({
            where: { id: req.params.userid },
        });

        if(!isExist) {
            res.status(404).json({ message: "User tidak ditemukan" });
            return;
        }

        const doDelete = await prisma.Users.delete({
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