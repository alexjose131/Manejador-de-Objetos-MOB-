import express from "express";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import router from "./routes";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api", router);
app.set("port", process.env.PORT || 3000);


app.listen(app.get("port"), () => {
  console.log(`Server running in port ${app.get("port")}`);
  console.log(path.join(__dirname, "public"));
});

