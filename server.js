import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import { render } from "ejs";



const tokenAccessURL = "https://kitsu.io/api/oauth/token";
const allAnime = "https://kitsu.io/api/edge/anime"
const port = 3000;
const app = express();
let userEmail;
let userPassword;
let token;

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

    userEmail = email;
    userPassword = password;
    try {
        const response = await axios.post(tokenAccessURL, {
            grant_type: "password",
            username: email,
            password: password
        });

        token = response.data.access_token;
        res.render("account.ejs", { token: response.data.access_token, error: false });
    } catch (error) {
        console.error(error.response.data.error_description);
        res.render("account.ejs", { token: false, error: true });
    }
})

app.get("/homepage", async (req, res) => {
    if ((userEmail && userPassword) || token) {
        try {
            const response = await axios.get(allAnime);
            console.log(response.data.links.first);
        } catch (error) {
            console.error(error.response);
        }
        res.render("homepage.ejs");
    } else {
        res.send("<p>you're trying to access the homepage without logging in through kitsu, login using kitsu first.</p>");
    }
})

app.listen(port, () => {
    console.log(`listening on http://localhost:${port}`);
})

