/******************************************
request example:
{
    "request": {
        "passengers": {
            "adultCount": "1"
        },
      "slice": [
        {
            "origin": "SFO",
            "destination": "LAX",
            "date": "2014-09-19"
        }
      ],
      "solutions": "1"
    }
}
*******************************************/

module.exports = {
    searchFlights: function (origin, destination, date) {
        return new Promise(function (resolve) {
            //var mkey = "AIzaSyBtLFx1KelqS2oXakjJwpTOd0B1n3dpD4Y";     //misalab.uml@gmail.com
            //var mkey = "AIzaSyDPd3hJP-ft5ALms6dkfDHtS6VbNRjEIs8";     //uml.cgl@gmail.com
            var mkey = "AIzaSyCdZ7K0LtYQrA20h6KFrkfLSdaveFowKMI";       //misalab.os309@gmail.com
            var host = "https://www.googleapis.com";
            var path = "/qpxExpress/v1/trips/search?key=";
            var url = host + path + mkey;

            var passengers = {};
            passengers.adultCount = "1";

            var slice = []; //创建数组
            var departure = {}; //创建对象
            departure.origin = origin;
            departure.destination = destination;
            var month = date.getMonth() + 1;
            var day = date.getDate();
            var year = date.getFullYear();
            if (month < 10) {
                if (day < 10) {
                    departure.date = year.toString() + "-0" + month.toString() + "-0" + day.toString();
                } else {
                    departure.date = year.toString() + "-0" + month.toString() + "-" + day.toString();
                }
            } else {
                if (day < 10) {
                    departure.date = year.toString() + "-" + month.toString() + "-0" + day.toString();
                } else {
                    departure.date = year.toString() + "-" + month.toString() + "-" + day.toString();
                }
            }
            //console.log("Date:", departure.date)
            slice.push(departure);

            var requestdata = {};
            requestdata.passengers = passengers;
            requestdata.slice = slice;
            requestdata.solutions = "500";

            var msg = {};
            msg.request = requestdata;

            var mjson = JSON.stringify(msg);

            var price_list = [];
            var duration_list = [];

            var recommendation = {};

            /////////////////////////////////
            //send http post to google api
            ////////////////////////////////
/*            var http = require('http');

            var options = {
                url: url,
                method: 'POST',
                headers: {
                    "content-type": "application/json",
                }
            }

            var req = http.request(options, function (res) {
                res.setEncoding('utf8');
                res.on('data', function (data) {
                    //console.log("data:", data);   //一段html代码
                    var obj = JSON.parse(data);
                    var flight_list = obj.trips.tripOption;
                    for (var i = 0; i < flight_list.length; i++) {
                        var priceString = flight_list[i].saleTotal;
                        var price = parseFloat(priceString.split("USD")[1]);
                        var duration = flight_list[i].slice[0].duration;

                        price_list.push(price);
                        duration_list.push(duration);
                    }
                    var n_prices = normalize(price_list);
                    var n_durations = normalize(duration_list);

                    var score_list = [];
                    var minScore = 2;
                    var index = 0;

                    for (var i = 0; i < price_list.length; i++) {
                        var score = Math.sqrt(n_prices[i] * n_prices[i] + n_durations[i] * [i]);
                        if (score < minScore) {
                            minScore = score;
                            index = i;
                        }
                        score_list.push(score);
                    }

                    recommendation.price = price_list[index];
                    recommendation.duration = duration_list[index];
                    recommendation.numb_stops = flight_list[index].segment.length - 1;
                    recommendation.segments = [];
                    for (var i = 0; i < flight_list[index].segment.length; i++) {
                        var segment = {};
                        segment.duration = flight_list[index].segment[i].duration;
                        segment.carrier = light_list[index].segment[i].flight.carrier;
                        segment.flight_number = light_list[index].segment[i].flight.number;
                        segment.cabin = light_list[index].segment[i].cabin;
                        segment.departureTime = light_list[index].segment[i].leg[0].departureTime;
                        segment.arrivalTime = light_list[index].segment[i].leg[0].arrivalTime;
                        segment.origin = light_list[index].segment[i].leg[0].origin;
                        segment.destination = light_list[index].segment[i].leg[0].destination;
                        if (light_list[index].segment[i].hasOwnProperty(connectionDuration)) {
                            segment.connectionDuration = light_list[index].segment[i].connectionDuration;
                        }
                        recommendation.segments.push(segment);
                    }
                    if (recommendation.numb_stops > 0) {
                        recommendation.stops = [];
                        for (var i = 0; i < recommendation.segments.length - 1; i++) {
                            recommendation.stops.push(recommendation.segments[i].destination)
                        }
                    }
                    recommendation.departureTime = recommendation.segments[0].departureTime;
                    recommendation.origin = recommendation.segments[0].origin;
                    recommendation.arrivalTime = recommendation.segments[recommendation.segments.length - 1].arrivalTime;
                    recommendation.destination = recommendation.segments[recommendation.segments.length - 1].destination;
                });
            });

            req.write(mjson);
            req.end;
*/
            var request = require('request');

            var options = {
                url: url,
                method: "POST",
                headers: {"content-type": "application/json"},
                json: msg
            }
            //console.log("url:", url);
            //console.log("msg:", msg);
            //console.log("msg:", mjson);
            //console.log("options:", options);
            var req = request(options, function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    //console.log(body)
                    var obj = body;//JSON.parse(body);
                    var flight_list = obj.trips.tripOption;
                    for (var i = 0; i < flight_list.length; i++) {
                        var priceString = flight_list[i].saleTotal;
                        var price = parseFloat(priceString.split("USD")[1]);
                        var duration = flight_list[i].slice[0].duration;

                        price_list.push(price);
                        duration_list.push(duration);
                    }
                    var n_prices = normalize(price_list);
                    var n_durations = normalize(duration_list);

                    var score_list = [];
                    var minScore = 2;
                    var index = 0;

                    for (var i = 0; i < price_list.length; i++) {
                        var score = Math.sqrt(n_prices[i] * n_prices[i] + n_durations[i] * [i]);
                        if (score < minScore) {
                            minScore = score;
                            index = i;
                        }
                        score_list.push(score);
                    }

                    recommendation.price = price_list[index];
                    console.log("=======>price: ", recommendation.price);
                    recommendation.duration = duration_list[index];
                    var segements = flight_list[index].slice[0].segment;
                    recommendation.numb_stops = segements.length - 1;
                    recommendation.segments = [];
                    for (var i = 0; i < segements.length; i++) {
                        var segment = {};
                        segment.duration = segements[i].duration;
                        segment.carrier = segements[i].flight.carrier;
                        segment.flight_number = segements[i].flight.number;
                        segment.cabin = segements[i].cabin;
                        segment.departureTime = segements[i].leg[0].departureTime;
                        segment.arrivalTime = segements[i].leg[0].arrivalTime;
                        segment.origin = segements[i].leg[0].origin;
                        segment.destination = segements[i].leg[0].destination;
                        if (segements[i].hasOwnProperty("connectionDuration")) {
                            segment.connectionDuration = segements[i].connectionDuration;
                        }
                        recommendation.segments.push(segment);
                    }
                    if (recommendation.numb_stops > 0) {
                        recommendation.stops = [];
                        for (var i = 0; i < recommendation.segments.length - 1; i++) {
                            recommendation.stops.push(recommendation.segments[i].destination)
                        }
                    }
                    recommendation.departureTime = recommendation.segments[0].departureTime;
                    recommendation.origin = recommendation.segments[0].origin;
                    recommendation.arrivalTime = recommendation.segments[recommendation.segments.length - 1].arrivalTime;
                    recommendation.destination = recommendation.segments[recommendation.segments.length - 1].destination;
                }
                else {

                    console.log("error: " + error)
                    console.log("response.statusCode: " + response.statusCode)
                    console.log("response.statusText: " + response.statusText)
                }
                //console.log("req: " + req.body);
            });
            //return recommendation;
/*
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    var obj = JSON.parse(this.responseText);
                    var flight_list = obj.trips.tripOption;
                    for (var i = 0; i < flight_list.length; i++) {
                        var priceString = flight_list[i].saleTotal;
                        var price = parseFloat(priceString.split("USD")[1]);
                        var duration = flight_list[i].slice[0].duration;

                        price_list.push(price);
                        duration_list.push(duration);
                    }
                    var n_prices = normalize(price_list);
                    var n_durations = normalize(duration_list);

                    var score_list = [];
                    var minScore = 2;
                    var index = 0;

                    for (var i = 0; i < price_list.length; i++) {
                        var score = Math.sqrt(n_prices[i] * n_prices[i] + n_durations[i] * [i]);
                        if (score < minScore) {
                            minScore = score;
                            index = i;
                        }
                        score_list.push(score);
                    }

                    recommendation.price = price_list[index];
                    recommendation.duration = duration_list[index];
                    recommendation.numb_stops = flight_list[index].segment.length - 1;
                    recommendation.segments = [];
                    for (var i = 0; i < flight_list[index].segment.length; i++) {
                        var segment = {};
                        segment.duration = flight_list[index].segment[i].duration;
                        segment.carrier = light_list[index].segment[i].flight.carrier;
                        segment.flight_number = light_list[index].segment[i].flight.number;
                        segment.cabin = light_list[index].segment[i].cabin;
                        segment.departureTime = light_list[index].segment[i].leg[0].departureTime;
                        segment.arrivalTime = light_list[index].segment[i].leg[0].arrivalTime;
                        segment.origin = light_list[index].segment[i].leg[0].origin;
                        segment.destination = light_list[index].segment[i].leg[0].destination;
                        if (light_list[index].segment[i].hasOwnProperty(connectionDuration)) {
                            segment.connectionDuration = light_list[index].segment[i].connectionDuration;
                        }
                        recommendation.segments.push(segment);
                    }
                    if (recommendation.numb_stops > 0) {
                        recommendation.stops = [];
                        for (var i = 0; i < recommendation.segments.length - 1; i++) {
                            recommendation.stops.push(recommendation.segments[i].destination)
                        }
                    }
                    recommendation.departureTime = recommendation.segments[0].departureTime;
                    recommendation.origin = recommendation.segments[0].origin;
                    recommendation.arrivalTime = recommendation.segments[recommendation.segments.length - 1].arrivalTime;
                    recommendation.destination = recommendation.segments[recommendation.segments.length - 1].destination;

                    //document.getElementById("demo").innerHTML = JSON.stringify(flight_list[index]);
                    //document.getElementById("demo1").innerHTML = Math.min(...price_list);
                } else {
                    console.log("Flight search Error: " + this.status);
                }
            };
            xhttp.open("POST", url, true);
            //xhttp.open("POST", "demo_post2.asp", true);
            xhttp.setRequestHeader('content-type', 'application/json');
            //xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhttp.send(mjson);
*/
            // complete promise with a timer to simulate async response
            setTimeout(function () { resolve(recommendation); }, 10000);
        });
    }
}
function normalize(numArray) {
    var normalized = []
    var max = Math.max(...numArray);
    var min = Math.min(...numArray);

    for (var i = 0; i < numArray.length; i++) {
        normalized.push((numArray[i] - min) / (max - min));
    }
    return normalized;
}
