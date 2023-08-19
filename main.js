// Include the jQuery library for DOM manipulation and event handling.
// <reference path="jquery-3.6.1.js" />

// Enforce strict mode for error checking and better coding practices.
"use strict"

// Execute the following when the DOM is ready.
$(() => {

  // Assign event handlers to various buttons/links.
  $("#currenciesLink").click(displayCoins);
  $("#liveReports").click(liveReports);
  $("#aboutLink").click(aboutLink);

  // Initialize variables for holding coins and search results.
  let coins;
  let searchCoinByUser;
  let searchCoinByUserGraph;
  let graph = {};
  let intervalGraph;


  // Define an async function to fetch JSON data from a given URL.
  async function getJson(url) {
    try {
      // Use the Fetch API to get the data.
      const response = await fetch(url);
      const json = await response.json();
      return json;
    } catch (err) {
      // If there's an error, display an alert.
      alert("please try again later.");
    }
  }

  // Define an async function to load and display coin data.
  async function loadCoins() {
    try {
      const result = await getJson("https://api.coingecko.com/api/v3/coins/");
      coins = result;
      displayCoins();
    } catch {
      alert("please try again later.");
    }
  }

  // Load coins when the script runs.
  loadCoins();

  $("#searchCoinsButton").click(() => {
    const clientValue = $("#boxSearch").val();
    searchCoinByUser = coins.filter(coins => coins.symbol.toUpperCase() === clientValue.toUpperCase());
    displayCoins();
  });

  $("#searchCoinsButtonGraph").click(() => {
    const clientValueGraph = $("#boxSearchGraph").val();
    searchCoinByUserGraph = coins.filter(coins => coins.symbol.toUpperCase() === clientValueGraph.toUpperCase());
    liveReports();
  });

  function displayCoins() {
    let currentCoins;

    if (searchCoinByUser === undefined) {
      currentCoins = coins;
    } else if (searchCoinByUser.length === 0) {
      currentCoins = coins;
    } else {
      currentCoins = searchCoinByUser;
    }

    searchCoinByUserGraph = undefined;
    clearInterval(intervalGraph);
    $("#contactDiv").empty();
    $("#liveReportsDiv").empty();
    $(".searchArea").css("display", "block");
    $(".searchAreaGraph").css("display", "none");
    $("#boxSearch").val("");
    $("#boxSearchGraph").val("");

    let html = ""

    for (const coin of currentCoins)
      html += `
          <div class="card">
            <div class="nameCard">
              Symbol: ${coin.symbol}
              <br>
              Name: ${coin.name}
            </div>
              
            <button class="btn primary" type="button" data-bs-toggle="collapse" data-bs-target="#${coin.id}"
            aria-expanded="false" aria-controls="collapseExample">More Info</button>  

            <div class="collapse" id=${coin.id}> 
              <div class="card-body"> 
                <img src="${coin.image.thumb}">
                <br>
                USD: ${coin.market_data.current_price.usd} $
                <br>
                EUR: ${coin.market_data.current_price.eur} €
                <br>
                ILS: ${coin.market_data.current_price.ils} ₪ 
              </div>
            </div>
          </div>`
        }

    $("#contactDiv").append(html);
  }

  function liveReports() {
    clearInterval(intervalGraph);
    searchCoinByUser = undefined;
    $("#contactDiv").empty();
    $(".searchAreaGraph").css("display", "block");
    $(".searchArea").css("display", "none");

    graph = {
      exportEnabled: true,
      animationEnabled: true,
      title: {
        text: "Live Reports",
        margin: 50
      },
      axisX: {
        title: "Current time",
        valueFormatString: "DDD HH:mm:ss"
      },
      axisY: {
        title: "USD",
        titleFontColor: "#4F81BC",
        lineColor: "#4F81BC",
        labelFontColor: "#4F81BC",
        tickColor: "#4F81BC"
      },
      toolTip: {
        shared: true
      },
      legend: {
        cursor: "pointer",
      },
    }

    if (searchCoinByUserGraph === undefined) {
      $("#liveReportsDiv").empty();
      $("#liveReportsDiv").append("To display the graph, you have to search in search box by the symbol of the currency.");
      clearInterval(intervalGraph);
    }
    else if (searchCoinByUserGraph.length === 0) {
      $("#liveReportsDiv").empty();
      $("#liveReportsDiv").append("To display the graph, you have to search in search box by the symbol of the currency.");
      clearInterval(intervalGraph);
    }
    else {
      const symbolNames = searchCoinByUserGraph.map(result => result.symbol).toString().toUpperCase();

      intervalGraph = setInterval(() => {
        $.ajax({
          url: `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${symbolNames},&tsyms=USD&api_key=`,
          success: data => {
            paintGraphOnCanvas(data);
          },
          error: err => alert("Error: " + err.status)
        });
      }, 2000);
    }
  }

  function paintGraphOnCanvas(data) {
    let graphData = [];

    for (const [key, value] of Object.entries(data)) {
      if (coins[key.toLowerCase()]) {
        coins[key.toLowerCase()].push({ x: new Date(), y: value["USD"] });
      }
      else {
        coins[key.toLowerCase()] = [{ x: new Date(), y: value["USD"] }];
      }
    };

    coins.forEach(coin => {
      graphData.push(
        {
          type: "spline",
          name: coin.name,
          showInLegend: true,
          yValueFormatString: `${coin.market_data.current_price.usd}`,
          dataPoints: coins[coin.symbol]
        });
    });
    graph.data = graphData;

    $("#liveReportsDiv").CanvasJSChart(graph);
  }

  function aboutLink() {
    clearInterval(intervalGraph);
    $("#contactDiv").empty();
    $("#liveReportsDiv").empty();
    $(".searchAreaGraph").css("display", "none");
    $(".searchArea").css("display", "none");

    let html = ""

    html += `
        <div class="about">
          I'm introducing this piece of JavaScript code that combines jQuery and asynchronous functions,
          targeting anyone interested in cryptocurrency. 
          This tool has features that get and display the latest data from cryptocurrency sources.
          It offers real-time updates, so you can navigate the cryptocurrency world in a way that works for you. 
          The loadCoins() and displayCoins() functions provide a stream of fresh, accessible data. 
          If you prefer visual data, the liveReports() function offers a column chart of chosen currencies, 
          updated in real time. This code reflects careful use of modern JavaScript concepts, asynchronous functions, 
          and jQuery. The emphasis is on clear and maintainable code, with carefully structured and clearly named functions. 
          So, this is a straightforward, real-time approach to tracking cryptocurrency. 
          Begin your digital currency journey here.
        </div>`

    $("#contactDiv").append(html);
  }
});
