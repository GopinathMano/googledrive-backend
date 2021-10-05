require("dotenv").config();
const express = require("express");

const cors = require("cors");
const app = express();

const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

let { emailVerification, resetPassword } = require("./emailVerification");
const { confirmation, authenticate } = require("./middlewares");
// const { uploadFile } = require("./upload");

const port = 8080;

app.use(express.json());
app.use(cors());

const dbUrl = process.env.DB_URL;

app.get("/", authenticate, async (req, res) => {
  try {
    const clientInfo = await mongoClient.connect(dbUrl);
    const db = clientInfo.db("google_drive");
    const data = await db.collection("drive_users").find().toArray();

    res.json(data);
    clientInfo.close();
  } catch (error) {
    console.log(error);
  }
});

app.post("/register", async (req, res) => {
  try {
    const clientInfo = await mongoClient.connect(dbUrl);
    const db = clientInfo.db("google_drive");
    const data = await db
      .collection("drive_users")
      .findOne({ email: req.body.email });
    if (data) {
      return res
        .status(409)
        .json({ messsage: "user with this email is already present" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    await db.collection("drive_users").insertOne({
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      password: hashedPassword,
      activation: false,
    });
    const token = jwt.sign(
      { email: req.body.email },
      process.env.ACCESS_TOKEN_SECRET_EMAIL
    );
    emailVerification(token, req.body.email);

    res.status(200).json({ message: "Email sent succesfully" });
    clientInfo.close();
  } catch (error) {
    console.log(error);
  }
});

app.get("/register/confirmation/:token", confirmation, (req, res) => {
  res.status(200).json({ message: "YOUR ACCOUNT IS ACTIVATED" });
});

app.post("/login", async (req, res) => {
  try {
    const clientInfo = await mongoClient.connect(dbUrl);
    const db = clientInfo.db("google_drive");
    const data = await db
      .collection("drive_users")
      .findOne({ email: req.body.email });
    if (!data) {
      return res.status(404).json({ messsage: "not found" });
    }
    if (!data.activation) {
      return res.status(401).json({ messsage: "account not verified" });
    }
    const isValid = await bcrypt.compare(req.body.password, data.password);

    if (!isValid) {
      return res.status(400).json({ message: "wrong password" });
    }
    const token = jwt.sign(
      { email: data.email },
      process.env.ACCESS_TOKEN_SECRET
    );
    res.status(200).json({ messsage: "logged in", token: `${token}` });

    clientInfo.close();
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error });
  }
});

app.put("/forgotpassword", async (req, res) => {
  try {
    const clientInfo = await mongoClient.connect(dbUrl);
    const db = clientInfo.db("google_drive");
    const data = await db
      .collection("drive_users")
      .findOne({ email: req.body.email });
    if (!data) {
      return res.status(404).json({ messsage: "Email not found" });
    }
    if (!data.activation) {
      return res.status(401).json({ messsage: "account not verified" });
    }
    const token = jwt.sign(
      { email: req.body.email },
      process.env.ACCESS_TOKEN_SECRET_PASSWORD_RESET,
      { expiresIn: "1h" }
    );
    await db
      .collection("drive_users")
      .findOneAndUpdate(
        { email: req.body.email },
        { $set: { resetToken: token } }
      );
    console.log(token, req.body.email);
    resetPassword(token, req.body.email);
    res.status(200).json(`email sent to ${req.body.email}`);
  } catch (error) {
    console.log(error);
  }
});

app.put("/forgotpassword/resetpassword", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const clientInfo = await mongoClient.connect(dbUrl);
    const db = clientInfo.db("google_drive");
    const data = await db
      .collection("drive_users")
      .findOne({ resetToken: token });
    if (!data) {
      return res.status(400).json({ messsage: "token is not valid" });
    }
    const isValid = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET_PASSWORD_RESET
    );
    if (isValid) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      await db
        .collection("drive_users")
        .findOneAndUpdate(
          { resetToken: token },
          { $unset: { resetToken: token }, $set: { password: hashedPassword } }
        );

      res.status(200).json({ message: "password_updated" });
    }
  } catch (error) {
    console.log(error);
  }
});

// uploadFile("F:/Case Study/c.txt");
app.listen(port, () => console.log(`app is running on ${port}`));
