import express from "express";
import bodyParser from "body-parser";
import axios from "axios";


const homePageAnime = "https://kitsu.io/api/edge/anime?page%5Blimit%5D=18&page%5Boffset%5D=0";

let trendingAnime = "https://kitsu.io/api/edge/anime?filter[categories]=trending&page%5Blimit%5D=18&page%5Boffset%5D=0";
const tokenAccessURL = "https://kitsu.io/api/oauth/token";
let allAnime = "https://kitsu.io/api/edge/anime?page[limit]=18&page[offset]=0";
const port = 3000;
const app = express();

let trendingResponse;
let token;
let userEmail;
let userPassword;
let nextLink;
let prevLink;
let lastLink;

let trnextLink;
let trprevLink;
let trlastLink;
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
        console.error(error.response);
        //Incase we didnt acquired any token we can send value of token as false and value of token as true.
        res.render("account.ejs", { token: false, error: true });
    }
})

//this route gets the anime and sends the data to ejs
app.get("/homepage", async (req, res) => {

    //implementing logic for if when th user enters incorrect credentials we can restrict it's access from /homepage route.

    //this says that if login username and password and token is there, we should let the user access the homepage route.

    // if ((userEmail && userPassword) && token) {
    try {
        const response = await axios.get(homePageAnime);
        const fetchTrending = await axios.get(trendingAnime);

        res.render("homepage.ejs", { animeData: response.data.data, trendingAnime: fetchTrending.data.data, homePageCheck: "on-homepage" });

    } catch (error) {
        console.error(error.response);
    }

    // } else {
    //     res.send("<p>you're trying to access the homepage without logging in through kitsu, login using kitsu first.</p>");
    // }
})


//when user clicks on the next button this route is triggered.
app.get("/next", async (req, res) => {

    //here we are getting the response from allAnime varible.
    try {

        let trendingResponse, animeResponse;
        if (req.query.pgtype == 'trending') {
            console.log("test ok!");

            const currentPage = await axios.get(trendingAnime);

            trnextLink = currentPage.data.links.next;

            trendingResponse = await axios.get(trnextLink);
            trendingAnime = trnextLink;

        } else {

        
            const currentPage = await axios.get(allAnime);

            //using the above response to get the next link from next links object 
            nextLink = currentPage.data.links.next;

            //get the response from the next link .
            animeResponse = await axios.get(nextLink);

            //setting the allAnime variable as next link. So that if the user clicks the next button again it will be redirected to the nextlink of the previously clicked which is now (current) link since we set the allAnime to have the value of nextLink. 
            allAnime = nextLink;
        }

        if(!trendingResponse) {
            trendingResponse = await axios.get(trendingAnime);
        }

        if(!animeResponse) {
            animeResponse = await axios.get(allAnime);
        }

        res.render("homepage.ejs", {animeData: animeResponse.data.data, trendingAnime: trendingResponse.data.data});

    } catch (error) {
        console.error(error.response);
    }
})

app.get("/prev", async (req, res) => {
    //same logic as above but for previous link.

    try {

        if (req.query.pgtype == 'trending') {
            console.log("test ok!");

            const currentPage = await axios.get(trendingAnime);

            trprevLink = currentPage.data.links.prev;

            const response = await axios.get(trprevLink);
            trendingAnime = trprevLink;

            const fetchAllAnime = await axios.get(allAnime);
            res.render("homepage.ejs", { trendingAnime: response.data.data, animeData: fetchAllAnime.data.data });

        } else if (req.query.pgtype === undefined) {

            const currentPage = await axios.get(allAnime);
            prevLink = currentPage.data.links.prev;

            console.log(prevLink);

            //here we are implementing logic that when we pressed previous button if we redirect to the homepage then we would want the home and the prevoious button to be hidden

            //it says hide if homepage link is equals to the previous link.
            let btnChk = String(homePageAnime) === String(prevLink) ? "hide" : "unhide";

            const response = await axios.get(prevLink);
            allAnime = prevLink;



            res.render("homepage.ejs", { animeData: response.data.data, isPrevHome: btnChk });

        }
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

        res.render("homepage.ejs", { animeData: response.data.data });


    } catch (error) {
        console.error(error.response);
    }
})


app.listen(port, () => {
    console.log(`listening on http://localhost:${port}`);
})

