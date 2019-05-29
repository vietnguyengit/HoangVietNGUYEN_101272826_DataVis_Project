function hide_unemployment(direct) {
    //just to reset previous prints
    d3.select("#unemployment_info").selectAll("text").remove();
    d3.select("#unemployment_title").select("h4").remove();
    d3.select("#unemployment").select("svg").remove();
    if (direct) {
        d3.select("#unemployment_details").select("select").remove();
    }
}

var attributes = ["state", "working_age_population_15_64", "unemployment_rate_15", "youth_unemployment_rate_15_24"];
var titles = [];

var unemployment_CSV_converter = function(d) {
    return {
        state: d[attributes[0]],
        working_age_population_15_64: +d[attributes[1]],
        unemployment_rate_15: +d[attributes[2]],
        youth_unemployment_rate_15_24: +d[attributes[3]],
    };
};

function unemployment_options() {

    var options = "";
    for (var i = 1; i < attributes.length; i++) {
        var value = i - 1;
        if (i === 1) {
            titles[value] = "Working Age Population (15 to 64)";
        } else if (i === 2) {
            titles[value] = "Unemployment rate (15+)";
        } else {
            titles[value] = "Youth Unemployment Rate (15 to 24+)";
        }
        options += "<option value="+value+">"+titles[value]+"</option>";
    }

    document.getElementById("unemployment_details").innerHTML = "<select id='unemployment_options' onchange='return unemployment(this.value);'>" +
        options + "</select>";

    unemployment(0);
}


function unemployment(option) {
    //import dataset
    d3.csv("data/SA4_state_territory.csv", unemployment_CSV_converter, function (data) {
        generateMap(option, data);
    });
}

function generateMap(option, data) {

    hide_unemployment();

    var dataset = [];

    for (var i = 0; i < data.length; i++) {
        var obj = {};
        obj.state = data[i].state;

        if (option == 0) {
            obj.value = data[i].working_age_population_15_64;
        } else if (option == 1) {
            obj.value = data[i].unemployment_rate_15;
        } else {
            obj.value = data[i].youth_unemployment_rate_15_24;
        }

        dataset.push(obj);
    }

    var w = 850;
    var h = 550;

    var projection = d3.geoMercator()
        .center([140, -27])
        .scale(765);

    var path = d3.geoPath()
        .projection(projection);

    var color = d3.scaleQuantize()
        .range(colorbrewer.Blues["8"]);

    //Create SVG element
    var svg = d3.select("#unemployment")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

    color.domain([
        d3.min(dataset, function(d) { return d.value; }),
        d3.max(dataset, function(d) { return d.value; })
    ]);

    d3.json("AU_Geo.json", function (json) {

        for (var i = 0; i < dataset.length; i++) {

            //grab state name
            var dataState = dataset[i].state;

            //grab data value and convert from string to float
            var dataValue = parseFloat(dataset[i].value);

            //find the corresponding state inside the GeoJSON
            for (var j = 0; j < json.features.length; j++) {

                var jsonState = json.features[j].properties.STATE_NAME;
                if (dataState == jsonState) {
                    json.features[j].properties.value = dataValue;
                    break;
                }
            }
        }

        d3.select("#unemployment_title").append("h4").text(titles[option]);

        var state = svg.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .style("fill", function(d) {
                var value = d.properties.value;
                return color(value);
            })
            .style("stroke", "#000")
            .style("stroke-width", 0.8);

        var tooltip_w;
        var tooltip_h = 20;
        var tooltip_x;

        if (option == 0) {
            tooltip_w = 80;
            tooltip_x = -40;
        } else {
            tooltip_x = -30;
            tooltip_w = 60;
        }

        // Prep the tooltip bits, initial display is hidden
        var tooltip = svg.append("g")
            .attr("class", "tooltip")
            .style("display", "none");

        tooltip.append("rect")
            .attr("x", tooltip_x)
            .attr("width", tooltip_w)
            .attr("height", tooltip_h)
            .attr("fill", "orange")
            .style("stroke", "black")
            .style("stroke-width", 0.25);;

        tooltip.append("text")
            .attr("x", 0)
            .attr("dy", "1.2em")
            .style("text-anchor", "middle")
            .style('fill', 'black')
            .attr("font-size", "12px")
            .attr("font-weight", "bold");

        state.on("mouseover", function() { tooltip.style("display", null); })
            .on("mouseout", function(d, i) {
                tooltip.style("display", "none");
            })
            .on("mousemove", function(d, i) {
                var xPosition = d3.mouse(this)[0] - 20;
                var yPosition = d3.mouse(this)[1] - 23;
                tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
                if (option > 0) {
                    tooltip.select("text").text(d.properties.value.toFixed(2) + "%");
                } else {
                    tooltip.select("text").text(d.properties.value);
                }
            })
            .on("click", function(d, i) {

                d3.select("#unemployment_info").selectAll("text").remove();

                d3.select("#unemployment_info")
                    .append("h4")
                    .append("text")
                    .text("State: " + data[i].state)
                    .append("br");

                d3.select("#unemployment_info")
                    .append("text")
                    .text("Working Age Population (15 to 64): " + data[i].working_age_population_15_64)
                    .append("br");

                d3.select("#unemployment_info")
                    .append("text")
                    .text("Unemployment Rate (15+): " + data[i].unemployment_rate_15 + "%")
                    .append("br");

                d3.select("#unemployment_info")
                    .append("text")
                    .text("Youth Unemployment Rate (15 to 24+): " + data[i].youth_unemployment_rate_15_24 + "%");
            });

        d3.csv("data/cities.csv", function(data) {
            svg.selectAll("circle")
                .data(data)
                .enter()
                .append("circle")
                .attr("cx", function(d) {
                    return projection([d.lon, d.lat])[0];
                })
                .attr("cy", function(d) {
                    return projection([d.lon, d.lat])[1];
                })
                .attr("r", 3)
                .style("fill", "#FF4500")
                .style("stroke", "#FF4500")
                .style("stroke-width", 0.25)
        });
    });
}