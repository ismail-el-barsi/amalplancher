import jwt from "jsonwebtoken";

export const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isConducteur: user.isConducteur,
      isSecretaire: user.isSecretaire,
    },
    process.env.JWT_SECRET, //secret string to encrypt data
    {
      expiresIn: "30d",
    }
  );
};
export const isAuth = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (authorization) {
    const token = authorization.slice(7, authorization.length); // Bearer XXXXXX
    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        res.status(401).send({ message: "Invalid Token" });
      } else {
        req.user = decode;
        next();
      }
    });
  } else {
    res.status(401).send({ message: "No Token" });
  }
};
export const isAdmin = (req, res, next) => {
  if (
    req.user &&
    (req.user.isAdmin || req.user.isSecretaire || req.user.isConducteur)
  ) {
    next();
  } else {
    res.status(401).send({ message: "Invalid Admin Token" });
  }
};
