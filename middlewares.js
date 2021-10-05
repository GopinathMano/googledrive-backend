const jwt = require("jsonwebtoken");

const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;

const dbUrl = process.env.DB_URL;
async function confirmation(req, res, next) {
  try {
    const token = req.params.token;
    const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_EMAIL);

    const clientInfo = await mongoClient.connect(dbUrl);
    const db = clientInfo.db("google_drive");
    const data = await db
      .collection("drive_users")
      .findOne({ email: decode.email });
    if (data.activation) {
      return res
        .status(400)
        .json({ messsage: "account already activated try log in" });
    }
    await db
      .collection("drive_users")
      .findOneAndUpdate(
        { email: decode.email },
        { $set: { activation: true } }
      );
    //console.log(decode);
    next();
  } catch (error) {
    res.status(401).json({ messsage: "invalid account not verified" });
    console.log(error);
  }
}

async function authenticate(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null)
    return res.sendStatus(401).json({ messsage: "token is not present" });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    console.log(err);
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

module.exports = { confirmation, authenticate };
