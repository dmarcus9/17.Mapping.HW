  // Define streetmap 
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

// We then create the map object with options. Adding the tile layers we just
// created to an array of layers.
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap, darkmap]
  });

// We create the layer for our earthquakes set of data
var earthquakes = new L.LayerGroup();

// Define a baseMaps object to hold our base layers. Only one of these maps will be visible at a time!
var baseMaps = {
  Streetmap: streetmap,
  Darkmap: darkmap,};

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    "Earthquakes": earthquakes};

// Then we add a control to the map that will allow the user to change which
// layers are visible.
  L.control.layers(baseMaps, overlayMaps, earthquakes, {
    collapsed: false
  }).addTo(myMap);


  // Store our API endpoint inside queryUrl
  var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

  // Perform a GET request to the query URL
  d3.json(queryUrl, function(data) {
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
  });

  function createFeatures(earthquakeData) {
    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place, time & mag. of the earthquakes
    function onEachFeature(feature, layer) {
      layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" +
        "</h3><hr><p>" + "Magnitude: " + feature.properties.mag + "</p>");
    }

    function info(features) {
      return {
        fillOpacity: 0.75,
        color: "white",
        fillColor: getColor(features.properties.mag),
        radius: markerSize(features.properties.mag)
      }}

    // https://www.w3schools.com/colors/colors_picker.asp
    function getColor(mag) {
      switch (true) {
        case mag > 5:
          return "#000066";
        case mag > 4:
          return "#993399";
        case mag > 3:
          return "#e60000";
        case mag > 2:
          return "#ff8533";
        case mag > 1:
          return "#cca300";
        default:
          return "#ffff66";
      }}

    // 1.6 markerSize function gives each earthquake a different radius based on its mag.
    function markerSize(mag) {
      return mag * 9;}

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
      pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng)
      },
      style: info,
      onEachFeature: onEachFeature
    }).addTo(myMap);

    // https://leafletjs.com/examples/choropleth/  for creating the legend
    var legend = L.control({
      position: 'bottomright'
    });

    legend.onAdd = function(map) {

      var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 2, 3, 4, 5],
        colors = ["#ffff66", "#cca300", "#ff8533", "#e60000", "#993399", "#000066"];

      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
          "<i style='background: " + colors[i] + "'></i> " +
          grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
      }
      return div;
    };
    legend.addTo(myMap);
  };
