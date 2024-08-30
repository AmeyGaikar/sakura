import express from "express";
import bodyParser from "body-parser";
import axios from "axios";



const port = 3000;
const app = express();

app.use(express.static("./public"));

app.get("/", (req, res) => {
    res.render("index.ejs");
})

app.listen(port , () => {
console.log(`listening on http://localhost:${port}`);
})