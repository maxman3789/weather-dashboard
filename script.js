// quick refresher on Fetching https://bithacker.dev/fetch-weather-openweathermap-api-javascript

// reference video https://www.youtube.com/watch?v=nGVoHEZojiQ
// https://webdesign.tutsplus.com/tutorials/build-a-simple-weather-app-with-vanilla-javascript--cms-33893

// variables 
var cityListArray = [];
var cityName;
var apikey = "4e258af0605086dba3a3dbc93bf53c35";


// Pull city from local storage
function cityList() {
    var storedCities = JSON.parse(localStorage.getItem("cities"));
    
    if (storedCities !== null) {
        cityListArray = storedCities;
    }
    
    renderCities();
}
cityList();

//Display city on local storage
function showWeather() {
    var storedWeather = JSON.parse(localStorage.getItem("currentCity"));

    if (storedWeather !== null) {
        cityName = storedWeather;

        displayWeather();
        displayFiveDayForecast();
    }
}
showWeather();

// Searched Cities
function renderCities(){
    $("#cityList").empty();
    $("#cityInput").val("");
    
    for (i = 0; i< cityListArray.length; i++){
        var a = $("<a>");
        a.addClass("list-group-item list-group-item-action list-group-item-primary city");
        a.attr("data-name", cityListArray[i]);
        a.text(cityListArray[i]);
        $("#cityList").prepend(a);
    } 
}


// Button for City Search
$("#citySearchButton").on("click", function(event){
    event.preventDefault();

    cityName = $("#cityInput").val().trim();
    if (cityName === ""){
        alert("Enter a City")

    } else if (cityListArray.length >= 12){  
        cityListArray.shift();
        cityListArray.push(cityName);

    } else {
        cityListArray.push(cityName);
    }
    // saves city array to local storage
    localStorage.setItem("cities", JSON.stringify(cityListArray));
    // saves the currently display city to local storage
    localStorage.setItem("currentCity", JSON.stringify(cityName));

    renderCities();
    displayWeather();
    displayFiveDayForecast();
});


// create function for removing data off local storage
// https://www.section.io/engineering-education/how-to-use-localstorage-with-javascript/
function clearStorage(){ //clears the entire localStorage
    localStorage.clear()
    location.reload();
    console.log("clear records");
}
clear.addEventListener("click", clearStorage)


// This function runs the Open Weather API AJAX call and displays the current city, weather, and 5 day forecast to the DOM
// https://openweathermap.org/api/one-call-api
// https://openweathermap.org/current
// use of Async Function https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
// https://www.youtube.com/watch?v=_8gHHBlbziw
async function displayWeather() {

    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&units=imperial&appid=" + apikey;

    var response = await $.ajax({
        url: queryURL,
        method: "GET"
      })
        console.log(response);

        var currentWeatherDiv = $("<div class='card-body' id='currentWeather'>");
        var getCurrentCity = response.name;
        
        var date = new Date();
        var val = (date.getMonth() + 1) + "/"+ date.getDate() + "/" + date.getFullYear();
        
        //Weather icons https://openweathermap.org/weather-conditions
        var getCurrentWeatherIcon = response.weather[0].icon;
        var displayCurrentWeatherIcon = $("<p class='card-text'><img src = http://openweathermap.org/img/wn/" + getCurrentWeatherIcon + "@2x.png /></p>");
        
        var currentCityEl = $("<h3 class = 'card-body'>").text(getCurrentCity+ " (" +val+ ")");
        currentCityEl.append(displayCurrentWeatherIcon);
        currentWeatherDiv.append(currentCityEl);
        
        var getTemp = response.main.temp.toFixed(1);
        var tempEl = $("<p class='card-text'>").text("Temperature: " + getTemp + "° F");
        currentWeatherDiv.append(tempEl);
        
        var getHumidity = response.main.humidity;
        var humidityEl = $("<p class='card-text'>").text("Humidity: "+ getHumidity + "%");
        currentWeatherDiv.append(humidityEl);
        
        var getWindSpeed = response.wind.speed.toFixed(1);
        var windSpeedEl = $("<p class='card-text'>").text("Wind Speed: " + getWindSpeed + " mph");
        currentWeatherDiv.append(windSpeedEl);
        
        var longitude = response.coord.lon;
        var latitude = response.coord.lat;
        
        var uvURL = "https://api.openweathermap.org/data/2.5/uvi?appid=" + apikey + "&lat=" + latitude + "&lon=" + longitude;
        var uvResponse = await $.ajax({
            url: uvURL,
            method: "GET"
        })

        // Gets UV index and color changes
        // https://www.theweathernetwork.com/us/forecasts/uv/california/chula-vista
        var uvIndex = uvResponse.value;
        var uvNumber = $("<span>");
        if (uvIndex > 0 && uvIndex <= 2.99){
            uvNumber.addClass("low");
        } else if (uvIndex >= 3 && uvIndex <= 5.99){
            uvNumber.addClass("moderate");
        } else if (uvIndex >= 6 && uvIndex <= 7.99){
            uvNumber.addClass("high");
        } else if (uvIndex >= 8 && uvIndex <= 10.99){
            uvNumber.addClass("veryHigh");
        } else if (uvIndex >= 11){
            uvNumber.addClass("extreme");
        } 
        uvNumber.text(uvIndex);
        var uvIndexEl = $("<p class='card-text'>").text("UV Index: ");
        uvNumber.appendTo(uvIndexEl);

        currentWeatherDiv.append(uvIndexEl);
        $("#currentWeather").html(currentWeatherDiv);
}

// https://openweathermap.org/forecast5
async function displayFiveDayForecast() {

    var queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + cityName + "&units=imperial&appid=" + apikey;

    var response = await $.ajax({
        url: queryURL,
        method: "GET"
      })
      var forecastDiv = $("<div  id='fiveDayForecast'>");
      var forecastHeader = $("<h5 class='card-header border-secondary'>").text("5 Day Forecast");
      forecastDiv.append(forecastHeader);
      
      var cardDeck = $("<div  class='card-deck'>");
      forecastDiv.append(cardDeck);
      
      console.log(response);
      for (i=0; i < 5; i++){
          var forecastCard = $("<div class='card mb-3 mt-3'>");
          var cardBody = $("<div class='card-body'>");
          var date = new Date();
          var val=(date.getMonth()+1)+"/"+(date.getDate()+i+1)+"/"+date.getFullYear();
          var forecastDate = $("<h5 class='card-title'>").text(val);
          
        cardBody.append(forecastDate);

        var getCurrentWeatherIcon = response.list[i].weather[0].icon;
        console.log(getCurrentWeatherIcon);
        
        var displayWeatherIcon = $("<img src = http://openweathermap.org/img/wn/" + getCurrentWeatherIcon + ".png />");
        cardBody.append(displayWeatherIcon);
        
        var getTemp = response.list[i].main.temp;
        var tempEl = $("<p class='card-text'>").text("Temp: " + getTemp + "° F");
        cardBody.append(tempEl);
        
        var getHumidity = response.list[i].main.humidity;
        var humidityEl = $("<p class='card-text'>").text("Humidity: " + getHumidity + " %");
        cardBody.append(humidityEl);

        var getWindSpeed = response.list[i].wind.speed;
        var windSpeedEl = $("<p class='card-text'>").text("Wind Speed: " + getWindSpeed + " mph");
        cardBody.append(windSpeedEl);
        
        forecastCard.append(cardBody);
        cardDeck.append(forecastCard);
      }
      $("#fiveDayWeather").html(forecastDiv);
    }

// This function is used to pass the city in the history list to the displayWeather function
function historyDisplayWeather(){
    cityName = $(this).attr("data-name");
    displayWeather();
    displayFiveDayForecast();
    console.log(cityName);
}

$(document).on("click", ".city", historyDisplayWeather);

