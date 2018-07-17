require("dotenv").config();
let fs = require('fs');
let keys = require("./keys");
let Spotify = require("node-spotify-api");
let Twitter = require('twitter');
let moment = require('moment');
let request=require('request');

//var spotify = new Spotify({id: keys.spotify.id,secret: keys.spotify.secret});
let spotify = new Spotify(keys.spotify);
let client = new Twitter(keys.twitter);

let liri = {
    command: "",
    param: "",
    showMyTweets: function () {
        client.get('statuses/user_timeline.json?screen_name=Abhinav81627463&count=20', function (error, tweets) {
            if (error) {
                console.log(error);
            }
            let tweetArr=[];
            console.log("***************YOUR TWEETS***************\n");
            tweets.forEach((element) => {

                console.log(JSON.stringify(element.text) + "\n");
                console.log(JSON.stringify(element.created_at) + "\n");
                console.log("------------------------------------\n");
                tweetArr.push(JSON.stringify(element.text) +" | "+JSON.stringify(element.created_at));
            });

            logData = liri.command+" | "+tweetArr.toString();
            liri.logger(logData);
        });
    },
    songInfo: function (song) {


        spotify.search({ type: 'track', query: song, limit: '1' })
            .then(function (response) {

                if (response.tracks.total === 0) {
                    console.log("Requested song could not be found, please update your search string\n");
                } else {
                    console.log("***************SONG INFO***************\n");
                    console.log("Track: " + response.tracks.items[0].name + "\n");
                    console.log("Artist: " + response.tracks.items[0].album.artists[0].name + "\n");
                    console.log("Album: " + response.tracks.items[0].album.name + "\n");
                    console.log("Preview: " + response.tracks.items[0].external_urls.spotify + "\n");
                    console.log("------------------------------------\n");
                }

                logData = liri.command+" | "+liri.param+" | "+ response.tracks.items[0].name +" | " + response.tracks.items[0].album.artists[0].name +" | "+
                response.tracks.items[0].album.name +" | "+ response.tracks.items[0].external_urls.spotify 
                liri.logger(logData);

            })
            .catch(function (err) {
                console.log(err);
                logData = liri.command+" | "+err.toString();
                liri.logger(logData);
            });
    },
    movieInfo: function (movieName) {

        let queryUrl = "https://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=trilogy";


        request(queryUrl, (error, response) => {

            if (!error && response.statusCode === 200 && JSON.parse(response.body).Response !== "False") {

                console.log("***************MOVIE INFO*************\n");

                console.log("Title: " + JSON.parse(response.body).Title + "\n");
                console.log("Release Year: " + JSON.parse(response.body).Year + "\n");
                console.log("IMDB Rating: " + JSON.parse(response.body).imdbRating + "\n");

                if (JSON.parse(response.body).Ratings.length > 1) {
                    console.log("Rotten Tomatoes Rating: " + JSON.parse(response.body).Ratings[1].Value + "\n");

                }
                console.log("Country: " + JSON.parse(response.body).Country + "\n");
                console.log("Language: " + JSON.parse(response.body).Language + "\n");
                console.log("Plot: " + JSON.parse(response.body).Plot + "\n");
                console.log("Actors: " + JSON.parse(response.body).Actors) + "\n";
                console.log("***************------------------------***************\n");
                logData = liri.command+" | "+liri.param+" | "+ JSON.parse(response.body).Title +" | " + JSON.parse(response.body).Year +" | "+
                JSON.parse(response.body).imdbRating+" | "+ JSON.parse(response.body).Country+" | "+ JSON.parse(response.body).Language+" | "+ JSON.parse(response.body).Plot
                +" | "+ JSON.parse(response.body).Actors
                liri.logger(logData);


            } else {
                {
                    console.log("Requested movie could not be found, please update your search string\n");
                    logData = liri.command+" | Error";
                    liri.logger(logData);

                }
            }
        });
    },

    doWhatItSays: function () {
        fs.readFile('random.txt', 'utf8', (err, data) => {
            if (err) {
                console.log(err);
            }
            var text = data.split("\"");
            if(text===undefined){
                console.log("No Command Found");
            }
            text.forEach(element => {
                command = text[0].trim();
                param = text[1].trim();
            });

            
            //liri.command = command.trim();
            //liri.param = param.trim();
            logData = "do-what-it-says | "+command+" | "+param;
            liri.logger(logData);
            liri.liriActions(command, param);

        });
    },

    liriActions: function (command, param) {


        switch (command) {
            case "my-tweets":
                liri.showMyTweets();
                break;
            case "spotify-this-song":
                liri.songInfo(param);
                break;
            case "movie-this":
                if (param===undefined || param.length < 1) {
                    param = 'Mr. Nobody';
                }
                liri.movieInfo(param);
                break;
            case "do-what-it-says":
                liri.doWhatItSays();
                break;
            default:
                console.log("Oh! I don't know what to do...");
                break;
        }

    },

    logger:function(data){
        var now = moment().format('MM/DD/YYYY HH:MM:SS.SSSZ');
        data="\n"+now+"----------------------------------\n"+data+"\n"
                fs.appendFile('log.txt', "," + data, (err) => {
                    if (err) {
                        console.log(err);
                    }
                });
    }
}
liri.command = process.argv[2];
liri.param = "";
for (let i = 3; i < process.argv.length; i++) {
    liri.param = liri.param + process.argv[i] + " ";
}

liri.liriActions(liri.command, liri.param);


