const GlobalError = require("../error/GlobalError");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const { asyncCatch } = require("../utils/asyncCatch");
const User = require("../model/user");

const privateRoute = asyncCatch(async (req, res, next) => {
  let token;

  //1) Check if user sedn Header Auth
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) return next(new GlobalError("Please provide a token!"));

  //2) Check if token is Valid
  const verifiPromise = promisify(jwt.verify);
  const userInfo = await verifiPromise(token, process.env.JWT_SIGNATURE);

  //3)

  const user = await User.findById(userInfo.id);

  if (!user)
    return next(
      new GlobalError("Token that belongs to user is no longer exist!", 403)
    );

  req.user = user;

  next();
});

const access = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new GlobalError("You have not permission", 403));
    }

    next();
  };
};

module.exports = { privateRoute, access };
