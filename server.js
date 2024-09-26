import express from "express";
import bodyParser from "body-parser";
import axios, { all } from "axios";


const homePageAnime = "https://kitsu.io/api/edge/anime?page%5Blimit%5D=18&page%5Boffset%5D=0";
const homePageTrendingAnime = "https://kitsu.io/api/edge/anime?filter%5Bcategories%5D=trending&page%5Blimit%5D=18&page%5Boffset%5D=18";
let trendingAnime = "https://kitsu.io/api/edge/anime?filter%5Bcategories%5D=trending&page%5Blimit%5D=18&page%5Boffset%5D=18";
let allAnime = "https://kitsu.io/api/edge/anime?page[limit]=18&page[offset]=0";

const tokenAccessURL = "https://kitsu.io/api/oauth/token";
const port = 3000;
const app = express();

let token;
let userEmail;
let userPassword;

app.use(express.static("./public"));

app.use(express.urlencoded({ extended: true }));

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
app.get("/home", async (req, res) => {

    //implementing logic for if when th user enters incorrect credentials we can restrict it's access from /homepage route.

    //this says that if login username and password and token is there, we should let the user access the homepage route.

    // if ((userEmail && userPassword) && token) {
    try {
        const response = await axios.get(homePageAnime);
        const fetchTrending = await axios.get(homePageTrendingAnime);
        const typeOfReq = req.body.reqtype;


        res.render("homepage.ejs", {
            animeData: response.data.data,
            trendingAnime: fetchTrending.data.data, homePageChk: "on-homepage",
            homeRequestedby: typeOfReq
        });

    } catch (error) {
        console.error(error.response);
    }

    // } else {
    //     res.send("<p>you're trying to access the homepage without logging in through kitsu, login using kitsu first.</p>");
    // }
})

app.post("/prev", async (req, res) => {
    const typeOfReq = req.body.reqtype;
    let randomAnimeRes, trendingAnimeRes, rdPrevLink, trPrevLink, animePrevChk = 'unhide', trAnimePrevChk = 'unhide';

    try {
        if (typeOfReq === "randomAnime") {
            const response = await axios.get(allAnime);
            rdPrevLink = response.data.links.prev;
            randomAnimeRes = await axios.get(rdPrevLink);
            allAnime = rdPrevLink;
            // If the previous link is homePageAnime, set the flag to hide buttons

        } else {
            const response = await axios.get(trendingAnime);
            trPrevLink = response.data.links.prev;
            console.log(trPrevLink);
            trendingAnimeRes = await axios.get(trPrevLink);
            trendingAnime = trPrevLink;
        }

        if (!randomAnimeRes) {
            randomAnimeRes = await axios.get(allAnime);
        }

        if (!trendingAnimeRes) {
            trendingAnimeRes = await axios.get(trendingAnime);
        }

        if (rdPrevLink === homePageAnime) {
            animePrevChk = "hide";
        }

        if(trPrevLink === homePageTrendingAnime){
            trAnimePrevChk = "hide"
        }
        // Pass the flag to the template
        res.render("homepage.ejs", {
            animeData: randomAnimeRes.data.data,
            trendingAnime: trendingAnimeRes.data.data,
            isAnimePrevHome: animePrevChk,
            isTrAnimePrevHome: trAnimePrevChk 
            // Send the flag for anime section
        });
    } catch (error) {
        console.error(error.response);
    }
});

//when user clicks on the next button this route is triggered.
app.post("/next", async (req, res) => {
    const typeOfReq = req.body.reqtype;

    let randomAnimeRes, trendingAnimeRes, rdNextLink, trNextLink, whichAnimeBtn;
    try {
        if (typeOfReq === "randomAnime") {
            const response = await axios.get(allAnime);
            rdNextLink = response.data.links.next;
            randomAnimeRes = await axios.get(rdNextLink);

            whichAnimeBtn = "anime"
            allAnime = rdNextLink;
        } else {
            const response = await axios.get(trendingAnime);
            trNextLink = response.data.links.next;

            whichAnimeBtn = "trend"
            trendingAnimeRes = await axios.get(trNextLink);
            trendingAnime = trNextLink
        }


        if (!randomAnimeRes) {
            randomAnimeRes = await axios.get(allAnime);
        }

        if (!trendingAnimeRes) {
            trendingAnimeRes = await axios.get(trendingAnime);
        }

        res.render("homepage.ejs", {
            animeData: randomAnimeRes.data.data,
            trendingAnime: trendingAnimeRes.data.data,
            whichBtnWasClicked: whichAnimeBtn
        });
    } catch (error) {
        console.error(error.response);
    }

});

app.post("/first", async (req, res) => {
    //same logic as above but for previous link
    const typeOfReq = req.body.reqtype;

    let randomAnimeRes, trendingAnimeRes, rdFirstLink, trFirstLink;
    try {
        if (typeOfReq === "randomAnime") {
            const response = await axios.get(allAnime);
            rdFirstLink = response.data.links.first;
            randomAnimeRes = await axios.get(rdFirstLink);

            allAnime = rdFirstLink;
        } else {
            const response = await axios.get(trendingAnime);
            trFirstLink = response.data.links.first;

            trendingAnimeRes = await axios.get(trFirstLink);
            trendingAnime = trFirstLink
        }


        if (!randomAnimeRes) {
            randomAnimeRes = await axios.get(allAnime);
        }

        if (!trendingAnimeRes) {
            trendingAnimeRes = await axios.get(trendingAnime);
        }

        res.render("homepage.ejs", {
            animeData: randomAnimeRes.data.data,
            trendingAnime: trendingAnimeRes.data.data,
            onFirstPage: "yes",
        });
    } catch (error) {
        console.error(error.response);
    }

})

app.post("/last", async (req, res) => {
    const typeOfReq = req.body.reqtype;

    let randomAnimeRes, trendingAnimeRes, rdLastLink, trLastLink;
    try {
        if (typeOfReq === "randomAnime") {
            const response = await axios.get(allAnime);
            rdLastLink = response.data.links.last;
            randomAnimeRes = await axios.get(rdLastLink);

            allAnime = rdLastLink;
        } else {
            const response = await axios.get(trendingAnime);
            trLastLink = response.data.links.last;

            trendingAnimeRes = await axios.get(trFirstLink);
            trendingAnime = trFirstLink
        }


        if (!randomAnimeRes) {
            randomAnimeRes = await axios.get(allAnime);
        }

        if (!trendingAnimeRes) {
            trendingAnimeRes = await axios.get(trendingAnime);
        }

        res.render("homepage.ejs", {
            animeData: randomAnimeRes.data.data,
            trendingAnime: trendingAnimeRes.data.data,

        });
    } catch (error) {
        console.error(error.response);
    }

})

app.post("/anime",async (req, res) => {
    let animeId = req.body.anime_id;
    let animeClicked = "https://kitsu.io/api/edge/anime/" + animeId;

    try {
        const response = await axios.get(animeClicked);
    
        res.render("animePage.ejs", {animeData: response.data.data});
    } catch (error) {
        
    }
 
    
})

app.listen(port, () => {
    console.log(`listening on http://localhost:${port}/home`);
})

