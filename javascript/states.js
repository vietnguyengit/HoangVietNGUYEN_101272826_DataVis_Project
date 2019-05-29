var occupations = [];

function hide_states(direct) {
    //just to reset previous prints
    d3.select("#states_title").select("h4").remove();
    d3.select("#states").select("svg").remove();
    if (direct) {
        d3.select("#states_details").select("select").remove();
    }
}

var states_CSV_converter = function(d) {
    return {
        NSW: +d["NSW"],
        VIC: +d["VIC"],
        QLD: +d["QLD"],
        SA: +d["SA"],
        WA: +d["WA"],
        TAS: +d["TAS"],
        NT: +d["NT"],
        ACT: +d["ACT"],
        occupation: d.occupation
    };
};

function print_states_options() {

    //import dataset
    d3.csv("data/job_outlook.csv", states_CSV_converter, function (data) {

        for (var i = 0; i < data.length; i++) {
            occupations[i] = data[i].occupation;
        }

        var options = "";
        for (var i = 0; i < occupations.length; i++) {
            options += "<option value="+i+">"+occupations[i]+"</option>";
        }

        document.getElementById("states_details").innerHTML = "<select id='states_options' onchange='return states(this.value);'>" +
            options + "</select>";

        states(0);
    });

}

function states(option) {
    //import dataset
    d3.csv("data/job_outlook.csv", states_CSV_converter, function (data) {

        //0 need to be changed for dynamic charts
        var keys =  Object.keys(data[option]);
        var values =  Object.values(data[option]);
        var dataset = [];

        for (var i = 0; i < 8; i++) {
            var obj = {};
            obj.state = keys[i];
            obj.value = values[i];
            dataset.push(obj);
        }

        generateMap(option, dataset);
    });
}

function generateMap(option, dataset) {

    hide_states();

    var w = 850;
    var h = 550;

    var projection = d3.geoMercator()
        .center([140, -27])
        .scale(765);

    var path = d3.geoPath()
        .projection(projection);

    var color = d3.scaleQuantize()
        .range(colorbrewer.Greens["8"]);

    //Create SVG element
    var svg = d3.select("#states")
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

        d3.select("#states_title").append("h4").text("States and Territories" + " (% share) - " + occupations[option]);

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

        // Prep the tooltip bits, initial display is hidden
        var tooltip = svg.append("g")
            .attr("class", "tooltip")
            .style("display", "none");

        tooltip.append("rect")
            .attr("x", -30)
            .attr("width", 60)
            .attr("height", 20)
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
                tooltip.select("text").text(d.properties.value.toFixed(2) + "%");
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