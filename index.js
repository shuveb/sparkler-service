const express = require('express');
const fetch = require('node-fetch');

const PORT = process.env.PORT || 5000;

const Twit = require('twit');

const T = new Twit({
    consumer_key:           process.env.TWITTER_CONSUMER_KEY,
    consumer_secret:        process.env.TWITTER_CONSUMER_SECRET,
    app_only_auth:          true
});

const app        = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.json({ message: 'Welcome to the Sparkler service!' });
});

app.get('/tweet', function (req, res) {
   T.get('statuses/user_timeline', {screen_name: 'climagic'}, function (err, data, response) {
       if (err) {
           res.json({status: 'error'});
       }
       else {
           res.json({status: 'success', tweet:{ created_at: data[0].created_at, text: data[0].text } });
       }
   });
});

app.get('/air_quality', function (req, res) {
    const city = req.query.city || 'Chennai';
    const country = req.query.country || 'IN';
    fetch('https://api.openaq.org/v1/latest?country=' + country + '&city=' + city)
        .then(data=>{return data.json()})
        .then(function (result) {
            const simple_return = [];
            for (const r of result.results) {
                for (const measurement of r.measurements) {
                    if (measurement.parameter === 'pm25') {
                        const loc = r.location + ', ' + r.city + ', ' + r.country;
                        const o = {};
                        o[loc] = measurement.value.toFixed(2);
                        simple_return.push(o);
                    }
                }
            }
            res.json({status: 'success', data: simple_return})
        })
        .catch(err => {
           res.json({status: 'error', message: 'Unable to fetch air quality information.'});
        });
});

app.get('/weather', function (req, res) {
    let city = req.query.city || 'Chennai';
    city = city.toLowerCase();
    let woeid = 0;
    if (city === 'chennai')
        woeid = 2295424;
    else if (city === 'new delhi')
        woeid = 28743736;
    else if (city === 'london')
        woeid = 44418;
    else if (city === 'chicago')
        woeid = 2379574;
    else if (city === 'san francisco')
        woeid = 2487956;
    else if (city === 'new york')
        woeid = 2459115;
    else
        res.json({status: 'error', message: 'This city is not supported.'});

    fetch('https://www.metaweather.com/api/location/' + woeid)
        .then(data=>{return data.json()})
        .then(function (result) {
            res.json({status: 'success', data: result});
        })
        .catch(err => {
            res.json({status: 'error', message: 'Unable to fetch weather information.'});
        });
});

app.listen(PORT);
