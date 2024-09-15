import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import { render } from "ejs";



const tokenAccessURL = "https://kitsu.io/api/oauth/token";
const allAnime = "https://kitsu.io/api/edge/anime"
const port = 3000;
const app = express();

app.use(express.static("./public"));

app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
    res.render("index.ejs");
})

app.get("/getStarted", (req, res) => {
    res.render("account.ejs");
})

app.post("/submitKitsu", async (req, res) => {
    const email = req.body.mail;
    const password = req.body.password;
    try {


        const response = await axios.post(tokenAccessURL, {
            grant_type: "password",
            username: email,
            password: password
        });

        res.render("account.ejs", { token: response.data.access_token, error: false });
        console.log(response);
    } catch (error) {
        console.error(error.response.data.error_description);
        res.render("account.ejs", { token: false, error: true });
    }
})


app.get("/homepage", async (req, res) => {
    try {
        const response = await axios.get(allAnime);
        console.log(response.data.links.first);
    } catch (error) {
        console.error(error.response);
    }
    res.render("homepage.ejs");
})

app.listen(port, () => {
    console.log(`listening on http://localhost:${port}`);
})

