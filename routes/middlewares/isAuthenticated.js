import jwt from "jsonwebtoken";

export default function isAuthenticated(req, res, next) {
    if (
        req.headers &&
        req.headers.authorization &&
        req.headers.authorization.split(" ")[0] === "Bearer"
    ) {
        jwt.verify(
            req.headers.authorization.split(" ")[1],
            process.env.JWT_SECRET,
            async function (err, decoded) {
                if(err) {
                    res.status(401).json({ message: "Invalid token"});
                    return;
                }

                req.user = decoded

                next();
            }
        );
    }
    else {
        res.status(401).json({ message: "Unauthorized" });
    }
}