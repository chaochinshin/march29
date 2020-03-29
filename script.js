var searcHistory = [];

$(document).ready(function() {
  searcHistory = JSON.parse(window.localStorage.getItem("history"));
  console.log(searcHistory);
  if (searcHistory.length > 0) {
    searchWeather(searcHistory[searcHistory.length -1]);
    searcHistory.forEach(function(city) {
      makeRow(city);
    });
  }

  $("#search-button").on("click", function() {
    var searchValue = $("#search-value").val();

    // clear input box
    $("#search-value").val("");

    searchWeather(searchValue);
  });
  
  $(".history").on("click", "li", function() {
    searchWeather($(this).text());
  });

  function makeRow(text) {
    var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
    $(".history").append(li);
  }

  function searchWeather(searchValue) {
    $.ajax({
      type: "GET",
      url: "http://api.openweathermap.org/data/2.5/weather?q=" + searchValue + "&appid=7753ac2f0c36f8da09af492b59620b31&units=imperial",
      dataType: "json",
      success: function(data) {
        // create history link for this search
        if (searcHistory.indexOf(searchValue) === -1) {
          searcHistory.push(searchValue);
          window.localStorage.setItem("history", JSON.stringify(searcHistory));
    
          makeRow(searchValue);
        }
        
        // clear any old content
        $("#today").empty();

        // create html content for current weather
      
        var title = $("<h3>").addClass("card-title").text(data.name + " (" + new Date().toLocaleDateString() + ")");
        var card = $("<div>").addClass("card bg-success");
        var wind = $("<p>").addClass("card-text").text("Wind Speed: " + data.wind.speed + " MPH");
        var humid = $("<p>").addClass("card-text").text("Humidity: " + data.main.humidity + "%");
        var temp = $("<p>").addClass("card-text").text("Temperature: " + data.main.temp + " °F");
        var cardBody = $("<div>").addClass("card-body");
        var img = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png");

        // merge and add to page
        title.append(img);
        cardBody.append(title, temp, humid, wind);
        card.append(cardBody);
        $("#today").append(card);
        
        // call follow-up api endpoints
        getForecast(searchValue);
        getUVIndex(data.coord.lat, data.coord.lon);
      }
    });
  }
  function getUVIndex(lat,lon) {
    $.ajax({
      type: "GET",
      url: "http://api.openweathermap.org/data/2.5/uvi?lat=" + lat + "&lon=" + lon + "&appid=7753ac2f0c36f8da09af492b59620b31&units=imperial",
      dataType: "json",
      success: function(data) { 
        var color = ""
        if (data.value <= 2) {
          color = "green"
        }
        else if (data.value >=3 && data.value <= 7) {
          color = "yellow"
        }
        else if (data.value >= 8) {
          color = "red"
        }

        var card = $("<p>").addClass("card-text").text("UVI: " + data.value).css("background-color", color);
      $("#today .card .card-body").append(card);  
      }
    });
  }

//Get Started 
  function getForecast(searchValue) {
    $.ajax({
      type: "GET",
      url: "http://api.openweathermap.org/data/2.5/forecast?q=" + searchValue + "&appid=7753ac2f0c36f8da09af492b59620b31&units=imperial",
      dataType: "json",
      success: function(data) {  
        $("#forecast").empty();
        data.list.forEach(function(item){
        //  console.log(item);
          var dt = new Date(item.dt_txt)
          if (dt.getHours() == 12){
            
          var card = $("<div>").addClass("card bg-success");
          var datetime = $("<p>").addClass("card-text").text("Date & Time: " + item.dt_txt);
          var description = $("<p>").addClass("card-text").text("Forecast: " + item.weather[0].description);
          var wind = $("<p>").addClass("card-text").text("Wind Speed: " + item.wind.speed + " MPH");
          var humid = $("<p>").addClass("card-text").text("Humidity: " + item.main.humidity + "%");
          var temp = $("<p>").addClass("card-text").text("Temperature: " + item.main.temp + " °F");
          var pressure = $("<p>").addClass("card-text").text("Pressure: " + item.main.pressure);
          var cardBody = $("<div>").addClass("card-body");
          var img = $("<img>").attr("src", "http://openweathermap.org/img/w/" + item.weather[0].icon + ".png");
  
          // merge and add to page
          cardBody.append(img, description, datetime, temp, humid, wind, pressure);
          card.append(cardBody);
          $("#forecast").append(card);
          }
        })
      }
    });}
});
