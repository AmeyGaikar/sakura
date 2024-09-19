import express from "express";
import bodyParser from "body-parser";
import axios from "axios";


const homePageAnime = "https://kitsu.io/api/edge/anime?page%5Blimit%5D=18&page%5Boffset%5D=0";

let trendingAnime = "https://kitsu.io/api/edge/anime?filter%5Bcategories%5D=trending&page%5Blimit%5D=18&page%5Boffset%5D=18";
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

let trfirstLink;
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


    try {
        let trendingResponse, animeResponse;

        if (req.query.pgtype === 'trending') {
            console.log("Fetching next page for trending anime");

            // Fetch current trending page
            const currentPage = await axios.get(trendingAnime);
            trnextLink = currentPage.data.links.next;

            // Fetch the next trending anime page
            trendingResponse = await axios.get(trnextLink);
            console.log(trendingResponse.data.data[1].attributes.canonicalTitle);
            trendingAnime = trnextLink;  // Update trendingAnime to the next link

        } else {
            // Fetch current page for regular anime
            const currentPage = await axios.get(allAnime);
            nextLink = currentPage.data.links.next;

            // Fetch the next anime page
            animeResponse = await axios.get(nextLink);
            allAnime = nextLink;  // Update allAnime to the next link
        }

        // Fetch trending anime again (if it wasn't trending query)
        if (!trendingResponse) {
            trendingResponse = await axios.get(trendingAnime);
        }

        // Fetch anime data again (if it wasn't regular query)
        if (!animeResponse) {
            animeResponse = await axios.get(allAnime);
        }


        // Render the response only once
        res.render("homepage.ejs", {
            trendingAnime: trendingResponse.data.data,
            animeData: animeResponse.data.data,
            homePageCheck: "on-homepage"
        });

    } catch (error) {
        console.error(error.response);
        console.error(error);
        res.status(500).send("Error loading data");
    }
});

app.get("/prev", async (req, res) => {
    //same logic as above but for previous link.


    try {

        let trendingResponse, animeResponse;

        if (req.query.pgtype == 'trending') {

            const currentPage = await axios.get(trendingAnime);

            trprevLink = currentPage.data.links.prev;

            trendingResponse = await axios.get(trprevLink);
            trendingAnime = trprevLink;

        } else {

            const currentPage = await axios.get(allAnime);
            prevLink = currentPage.data.links.prev;

            //here we are implementing logic that when we pressed previous button if we redirect to the homepage then we would want the home and the prevoious button to be hidden
            //it says hide if homepage link is equals to the previous link.

            animeResponse = await axios.get(prevLink);
            allAnime = prevLink;
        }

        // Fetch trending anime again (if it wasn't trending query)
        if (!trendingResponse) {
            trendingResponse = await axios.get(trendingAnime);
        }

        // Fetch anime data again (if it wasn't regular query)
        if (!animeResponse) {
            animeResponse = await axios.get(allAnime);
        }

        let btnChk = String(homePageAnime) === String(prevLink) ? "hide" : "unhide";

        res.render("homepage.ejs", {
            animeData: animeResponse.data.data,
            trendingAnime: trendingResponse.data.data,
            isPrevHome: btnChk
        });


    } catch (error) {
        console.error(error.response);
    }
})

app.get("/last", async (req, res) => {
    try {

        let trendingResponse, animeResponse;
        if (req.query.pgtype == 'trending') {

            const currentPage = await axios.get(trendingAnime);

            trlastLink = currentPage.data.links.last;

            trendingResponse = await axios.get(trlastLink);
            trendingAnime = trlastLink;
        } else {
            const currentPage = await axios.get(allAnime);
            lastLink = currentPage.data.links.last;

            animeResponse = await axios.get(lastLink);
            allAnime = lastLink;
        }

        if (!trendingResponse) {
            trendingResponse = await axios.get(trendingAnime);
        }

        if (!animeResponse) {
            animeResponse = await axios.get(allAnime);
        }

        res.render("homepage.ejs", {
            animeData: animeResponse.data.data,
            trendingAnime: trendingResponse.data.data
        });


    } catch (error) {
        console.error(error.response);
    }
})


app.listen(port, () => {
    console.log(`listening on http://localhost:${port}/homepage`);
})

