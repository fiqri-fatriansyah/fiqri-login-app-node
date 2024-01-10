import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

import usersRoute from "./routes/users";
import loginRoute from "./routes/login";

import isAuthenticated from "./routes/middlewares/isAuthenticated";

const port = process.env.PORT || 3000;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(cors());

app.use("/users", isAuthenticated, usersRoute);
app.use("/login", loginRoute);

app.get("/*", (req, res) => {
    res.status(200).json({ message: `Hello, ma brudda!` });
});

app.post("/", (req, res) => {
    const { fullname, phone } = req.body;

    res.status(200).json({ fullname, phone });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})