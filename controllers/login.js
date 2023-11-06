const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const redis = require("redis");
const client = require("../redis");

dotenv.config();

async function checkUser(email) {
  try {
    const user = await User.findOne({ email: email });
    if (user) {
      return true;
    }
    return false;
  } catch (e) {
    return "Server Busy";
  }
}

async function AuthenticateUser(email, password) {
  try {
    const userChec = await User.findOne({ email: email });
    const validPassword = await bcrypt.compare(password, userCheck.password);
    console.log(validPassword);
    if (validPassword) {
      const token = jwt.sign({ email }, process.env.login_secret_token);
      const response = {
        id: userCheck._id,
        name: userCheck.name,
        email: userCheck.email,
        token: token,
        status: true,
      };
      await client.set(`key-${email}`, JSON.stringify(response));

      await User.findOneAndUpdate(
        { email: userCheck.email },
        { $set: { token: token } },
        { new: true }
      );
      return response;
    }
    return "Invalid User name or Password";
  } catch (e) {
    console.log(e);
    return "Server Busy";
  }
}

async function AuthorizeUser(token) {
  try {
    const decodedToken = jwt.verify(token, process.env.login_secret_token);
    if (decodedToken) {
      const email = decodedToken.email;
      const auth = await client.get(`key-${email}`);
      if (auth) {
        const data = JSON.parse(auth);
        return data;
      } else {
        const data = await User.findOne({ email: email });
        return data;
      }
    }
    return false;
  } catch (e) {
    console.log(e);
  }
}

module.exports = { checkUser, AuthenticateUser, AuthorizeUser };