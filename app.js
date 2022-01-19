import express from "express";
import mongoose from "mongoose";

const app = express();
app.use(express.urlencoded());
//DB
mongoose.connect(
  process.env.MONGODB_URL || "mongodb://localhost:27017/recurrent_visitors",
  { useNewUrlParser: true }
);
mongoose.connection.on("error", function (e) {
  console.error(e);
});

//Schema
const schema = {
  name: String,
  count: Number,
};

//Model
const Visitor = mongoose.model("visitors", schema);

//controller
app.get("/", async (req, res) => {
  let visitor;
  const name =
    req.query.name == undefined || req.query.name == ""
      ? "Anónimo"
      : req.query.name;
  if (name === "Anónimo") {
    visitor = new Visitor({ name, count: 1 });
    visitor.save((err, visitor) => {});
  } else {
    visitor = await Visitor.findOne({ name });
    if (visitor) {
      visitor.count += 1;
      console.log(visitor.count);
    } else {
      visitor = new Visitor({ name, count: 1 });
    }
    await visitor.save((err, visitor) => {});
  }
  const visitors = await Visitor.find();
  let table = `<table><thead><tr><th>ID</th><th>Name</th><th>Visits</th></tr></thead><tbody>`;
  visitors.forEach((visitor) => {
    table += `<tr><td>${visitor._id}</td><td>${visitor.name}</td><td>${visitor.count}</td></tr>`;
  });
  table += `</tbody></table>`;
  res.send(table);
});
app.listen(3000, () => console.log("Listening on port 3000!"));
