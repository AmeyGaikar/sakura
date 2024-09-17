import express from "express";
import bodyParser from "body-parser";
import axios, { all } from "axios";
import { render } from "ejs";


const homePageAnime = "https://kitsu.io/api/edge/anime?page[limit]=13&page[offset]=0"
const tokenAccessURL = "https://kitsu.io/api/oauth/token";
let allAnime = "https://kitsu.io/api/edge/anime?page[limit]=13&page[offset]=0"
const port = 3000;
const app = express();
let userEmail;
let userPassword;
let nextLink;
let prevLink;
let lastLink;
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
    // if ((userEmail && userPassword) || token) {
    try {
        const response = await axios.get(homePageAnime);
        // console.log(response);

        res.render("homepage.ejs", { animeData: response.data.data });
    } catch (error) {
        console.error(error.response);
    }

    // } else {
    //     res.send("<p>you're trying to access the homepage without logging in through kitsu, login using kitsu first.</p>");
    // }
})

app.get("/next", async (req, res) => {

    try {
        const currentPage = await axios.get(allAnime);
        nextLink = currentPage.data.links.next;

        const response = await axios.get(nextLink);
        allAnime = nextLink;
        console.log(allAnime);
        res.render("homepage.ejs", { animeData: response.data.data });
        

    } catch (error) {
        console.error(error.response);
    }
})

app.get("/prev", async (req, res) => {

    try {
        const currentPage = await axios.get(allAnime);
        prevLink = currentPage.data.links.prev;

        const response = await axios.get(prevLink);
        allAnime = prevLink;
        console.log(allAnime);
        res.render("homepage.ejs", { animeData: response.data.data });
        

    } catch (error) {
        console.error(error.response);
    }
})

app.get("/last", async (req, res) => {

    try {
        const currentPage = await axios.get(allAnime);
        lastLink = currentPage.data.links.last;

        const response = await axios.get(lastLink);
        allAnime = lastLink;
        console.log(allAnime);
        res.render("homepage.ejs", { animeData: response.data.data });
        

    } catch (error) {
        console.error(error.response);
    }
})


app.listen(port, () => {
    console.log(`listening on http://localhost:${port}`);
})

