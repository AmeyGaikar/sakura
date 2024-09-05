import express from "express";
import bodyParser from "body-parser";
import axios from "axios";



const tokenAccessURL = "https://kitsu.io/api/oauth/token";
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
    const userPassword = req.body.password;
    const userEmail = req.body.mail;

    try {
        const response = await axios.post(tokenAccessURL, {
            grant_type: 'password',
            username: userEmail,
            password: userPassword
        });

        // Token received, render page with token
        res.render("account.ejs", { token: response.data.access_token, error: null });

    } catch (error) {
        // No token, render page with error
        res.render("account.ejs", { token: null, error: true });
    }
});


app.listen(port, () => {
    console.log(`listening on http://localhost:${port}`);
})

