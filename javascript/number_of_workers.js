function hide_number_of_workers(direct) {
    //just to reset previous prints
    d3.select("#number_of_workers_title").select("h4").remove();
    d3.select("#number_of_workers").select("svg").remove();
    d3.select("#number_of_workers_legend").select("svg").remove();
    if (direct) {
        d3.select("#number_of_workers_details").select("select").remove();
    }
}

var number_of_worker_CSV_converter = function(d) {
    return {
        2008: +d["NoW_2008"],
        2009: +d["NoW_2009"],
        2010: +d["NoW_2010"],
        2011: +d["NoW_2011"],
        2012: +d["NoW_2012"],
        2013: +d["NoW_2013"],
        2014: +d["NoW_2014"],
        2015: +d["NoW_2015"],
        2016: +d["NoW_2016"],
        2017: +d["NoW_2017"],
        2018: +d["NoW_2018"],
        occupation: d.occupation
    };
};

var occupations = [];

function number_of_workers_options() {
    //import dataset
    d3.csv("data/job_outlook.csv", number_of_worker_CSV_converter, function (data) {

        for (var i = 0; i < data.length; i++) {
            occupations[i] = data[i].occupation;
        }

        var options = "<option value='all' selected>All occupations</option>";

        for (var i = 0; i < occupations.length; i++) {
            options += "<option value="+i+">"+occupations[i]+"</option>";
        }

        document.getElementById("number_of_workers_details").innerHTML = "<select id='number_of_workers_options' onchange='return drawLine(this.value);'>" +
            options + "</select>";

        number_of_workers();
    });
}

function drawLine(option) {
    //import dataset
    if(option === "all") {
        number_of_workers();
    }

    d3.csv("data/job_outlook.csv", number_of_worker_CSV_converter, function (data) {
        var linechart_dataset = Object.values(data[option]).slice(0, 11);
        d3.select("#number_of_workers_title").append("h4").text("Number of workers (2008 to 2018) - " + occupations[option]);
        lineChart(linechart_dataset);
    });
}

function now_tooltip(svg) {
    var tooltip;
    // Prep the tooltip bits, initial display is hidden
    tooltip = svg.append("g")
        .attr("class", "tooltip")
        .style("display", "none");

    tooltip.append("rect")
        .attr("width", 60)
        .attr("height", 20)
        .attr("fill", "white")
        .style("opacity", 0.8)
        .style("stroke", "black")
        .style("stroke-width", 0.25);

    tooltip.append("text")
        .attr("x", 30)
        .attr("dy", "1.2em")
        .style("text-anchor", "middle")
        .style('fill', 'black')
        .attr("font-size", "12px")
        .attr("font-weight", "bold");

    return tooltip;
}

function number_of_workers() {
    var dataset;
    //import dataset
    d3.csv("data/job_outlook.csv", number_of_worker_CSV_converter, function (data) {

        var big_array = [];
        for (var i = 0; i < data.length; i++) {
            var item = [];
            item = Object.entries(data[i]);
            big_array.push(item);
        }

        //create transposed data
        var transposedArray = [];
        var attributes = [];
        for (var k = 0; k < big_array[0].length - 1; k++) {
            var obj = {};
            //obj.year = big_array[0][i][0];
            for (var j = 0; j < big_array.length; j++) {
                attributes[j] = big_array[j][11][1];
                obj[big_array[j][11][1]] = big_array[j][k][1];
            }
            transposedArray.push(obj);
        }
        //assign value for dataset
        dataset = transposedArray;
        stackedBar(dataset, attributes);
    });
}

function lineChart(dataset) {

    hide_number_of_workers();

    var w = 850;
    var h = 400;

    var xpadding = 60;
    var ypadding = 20;

    //xScale
    var xScale = d3.scaleBand().domain(d3.range(dataset.length)).paddingInner(1).rangeRound([xpadding, w - xpadding]);
    //yScale
    var yScale = d3.scaleLinear().domain([0, d3.max(dataset, function (d) {
        return d;
    })]).rangeRound([h - ypadding, ypadding]);

    var line = d3.line()
        .x(function(d, i) { return xScale(i); })
        .y(function(d) { return yScale(d); })
        .curve(d3.curveLinear);

    //Easy colors accessible
    var colors = d3.scaleOrdinal().range(["#DAA520"]);

    //Create SVG element
    var svg = d3.select("#number_of_workers").append("svg").attr("width", w).attr("height", h);

    svg.append("path")
        .datum(dataset)
        .attr("class", "line")
        .attr("d", line);

    // Prep the tooltip bits, initial display is hidden
    var tooltip = now_tooltip(svg);

    svg.selectAll(".dot")
        .data(dataset)
        .enter().append("circle")
        .attr("class", "dot")
        .on("mouseover", function() {
            tooltip.style("display", null);
        })
        .on("mouseout", function(d, i) {
            d3.select(this).attr("fill", colors[i]);
            tooltip.style("display", "none");
        })
        .on("mousemove", function(d, i) {

            d3.select(this).attr("fill", "#778899");

            var xPosition = d3.mouse(this)[0] - 15;
            var yPosition = d3.mouse(this)[1] - 25;

            tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
            tooltip.select("text").text(d);
        })
        .transition()
        .delay(function(d, i) {
            return i/dataset.length * 500;
        })
        .duration(300)
        .ease(d3.easeCircleOut)

        .attr("cx", function(d, i) { return xScale(i) })
        .attr("cy", function(d) { return yScale(d) })
        .attr("r", 5);

    var years = ["2008", "2009", "2010", "2011", "2012", "2013", "2014", "2015", "2016", "2017", "2018"];
    //Adding the Axises
    var xAxis = d3.axisBottom().scale(xScale).ticks(11).tickFormat(function (d) {
        return years[d];
    });
    svg.append("g").attr("transform", "translate(0, " + (h - ypadding) + ")").call(xAxis).attr("font-family", "sans-serif")
        .attr("font-size", "12px");
    var yAxis = d3.axisLeft().ticks(6).scale(yScale);
    svg.append("g").attr("transform", "translate(" + xpadding + ", 0)").call(yAxis).attr("font-family", "sans-serif")
        .attr("font-size", "12px");
}

function stackedBar(dataset, attributes) {

    hide_number_of_workers();

    var w = 850;
    var h = 400;

    var xpadding = 60;
    var ypadding = 20;

    var stack = d3.stack().keys(attributes);

    var series = stack(dataset);

    //xScale
    var xScale = d3.scaleBand().domain(d3.range(dataset.length)).paddingInner(0.5).rangeRound([xpadding, w - xpadding]);

    //yScale
    var yScale = d3.scaleLinear().domain([0, d3.max(dataset, function (d) {

        var result = null;
        for (var i = 0; i < attributes.length; i++) {
            result = result + d[attributes[i]]
        }
        return result;

    })]).rangeRound([h - ypadding, 0]);

    //Easy colors accessible
    var colors = d3.scaleOrdinal().range(['#5b9bd5', '#ffc001', '#e47830', '#4471c3', '#778899']);

    //Create SVG element
    var svg = d3.select("#number_of_workers").append("svg").attr("width", w).attr("height", h);

    // Add a group for each row of data
    var groups = svg.selectAll("g").data(series).enter().append("g").style("fill", function (d, i) {
        return colors(i);
    });

    // Prep the tooltip bits, initial display is hidden
    var tooltip = now_tooltip(svg);

    d3.select("#number_of_workers_title").append("h4").text("Number of workers (2008 to 2018) - All occupations");

    // Add a rect for each data value
    var rects = groups.selectAll("rect")
        .data(function (d) {
            return d;
        })
        .enter()
        .append("rect")
        .attr("x", function (d, i) {
            return xScale(i);
        })
        .attr("y", function (d, i) {
            return yScale(d[1]);
        })
        .on("mouseover", function() {
            tooltip.style("display", null);
        })
        .on("mouseout", function(d, i) {
            d3.select(this).attr("fill", colors[i]);
            tooltip.style("display", "none");
        })
        .on("mousemove", function(d, i) {

            d3.select(this).attr("fill", "red");

            var xPosition = d3.mouse(this)[0] - 15;
            var yPosition = d3.mouse(this)[1] - 25;
            tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
            tooltip.select("text").text(d[1] - d[0]);
        })
        .transition()
        .delay(function(d, i) {
            return i/dataset.length * 500;
        })
        .duration(300)
        .ease(d3.easeCircleOut)
        .attr("height", function (d) {
            return yScale(d[0]) - yScale(d[1]);
        })
        .attr("width", xScale.bandwidth());

    var years = ["2008", "2009", "2010", "2011", "2012", "2013", "2014", "2015", "2016", "2017", "2018"];
    //Adding the Axises
    var xAxis = d3.axisBottom().scale(xScale).ticks(11).tickFormat(function (d) {
        return years[d];
    });

    svg.append("g").attr("transform", "translate(0, " + (h - ypadding) + ")").call(xAxis).attr("font-family", "sans-serif")
        .attr("font-size", "12px");

    var yAxis = d3.axisLeft().ticks(6).scale(yScale);
    svg.append("g").attr("transform", "translate(" + xpadding + ", 0)").call(yAxis).attr("font-family", "sans-serif")
        .attr("font-size", "12px");

    //Create SVG element
    var inner = d3.select("#number_of_workers_legend").append("svg").attr("width", w).attr("height", 110);
    var legspacing = 20;
    var legend = inner.selectAll(".legend")
        .data(attributes)
        .enter()
        .append("g");

    legend.append("rect")
        .attr("fill", colors)
        .attr("width", 15)
        .attr("height", 15)
        .attr("y", function (d, i) {
            return i * legspacing - 12;
        })
        .attr("x", 65)
        .attr("transform", "translate(0, 20)");

    legend.append("text")
        .attr("class", "label")
        .attr("y", function (d, i) {
            return i * legspacing;
        })
        .attr("x", 85)
        .attr("text-anchor", "start")
        .text(function (d, i) {
            return attributes[i];
        }).attr("font-family", "sans-serif")
        .attr("font-size", "12px")
        .attr("transform", "translate(0, 20)");

}