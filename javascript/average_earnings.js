function hide_average_earnings() {
    //just to reset previous prints
    d3.select("#average_earnings_title").select("h4").remove();
    d3.select("#average_earnings").select("svg").remove();
    d3.select("#average_earnings_short").select("button").remove();
}

function average_earnings() {

    var dataset = [];
    var attributes = ["salary"];

    var average_earnings_CSV_converter = function(d) {
        return {
            salary: +d["weekly_earning_before_tax"],
            occupation: d.occupation
        };
    };

    //import dataset
    d3.csv("data/job_outlook.csv", average_earnings_CSV_converter, function (data) {
        dataset = data;
        barChar();
    });

    function barChar() {

        hide_average_earnings();

        var w = 850;
        var h = 350;

        var xpadding = 60;
        var ypadding = 20;

        var stack = d3.stack().keys(attributes);

        var series = stack(dataset);

        //xScale
        var xScale = d3.scaleLinear().domain([0, d3.max(dataset, function (d) {

            var result = null;
            for (var i = 0; i < attributes.length; i++) {
                result = result + d[attributes[i]]
            }
            return result;

        })]).rangeRound([xpadding * 5, w - xpadding]);

        //Create SVG element
        var svg = d3.select("#average_earnings").append("svg").attr("width", w).attr("height", h);

        //yScale
        var yScale = d3.scaleBand().domain(d3.range(dataset.length)).paddingInner(0.5).rangeRound([h - ypadding, ypadding]);

        //Easy colors accessible
        var colors = d3.scaleOrdinal().range(["#25867e"]);

        // Add a group for each row of data
        var groups = svg.selectAll("g").data(series).enter().append("g").style("fill", function (d, i) {
            return colors(i);
        });

        // Prep the tooltip bits, initial display is hidden
        var tooltip = svg.append("g")
            .attr("class", "tooltip")
            .style("display", "none");

        tooltip.append("rect")
            .attr("x", -60)
            .attr("width", 120)
            .attr("height", 20)
            .attr("fill", "grey")
            .style("opacity", 0.6)
            .style("stroke", "black")
            .style("stroke-width", 0.25);;

        tooltip.append("text")
            .attr("x", 0)
            .attr("dy", "1.2em")
            .style("text-anchor", "middle")
            .style('fill', 'black')
            .attr("font-size", "12px")
            .attr("font-weight", "bold");

        d3.select("#average_earnings_title").append("h4").text("Weekly earnings (before tax) all occupations");

        // Add a rect for each data value
        var rects = groups.selectAll("rect")
            .data(function (d, i) {
                console.log(d);
                return d;
            })
            .enter()
            .append("rect")
            .attr("x", function (d, i) {
                return xScale(d[0]);
            })
            .attr("y", function (d, i) {
                return yScale(i);
            })
            .on("mouseover", function() {
                tooltip.style("display", null);
            })
            .on("mouseout", function() {
                tooltip.style("display", "none");
                d3.select(this)
                    .transition()
                    .delay(10)
                    .attr("fill", colors);
            })
            .on("mousemove", function(d) {
                d3.select(this).attr("fill", "#ffc001");
                var xPosition = d3.mouse(this)[0] - 15;
                var yPosition = d3.mouse(this)[1] - 25;
                tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
                tooltip.select("text").text("$" + (d[1] - d[0]) + " per week");
            })
            .transition()
            .delay(function(d, i) {
                return i/dataset.length * 500;
            })
            .attr("width", function (d, i) {
                return xScale(d[1]) - xScale(d[0]);
            })
            .duration(300)
            .attr("height", yScale.bandwidth());

        //Adding the Axises
        var occupations = [];
        for (var i = 0; i < dataset.length; i++) {
            occupations[i] = dataset[i].occupation;
        }

        var xAxis = d3.axisBottom().ticks(10).scale(xScale);
        svg.append("g").attr("transform", "translate(0, " + (h - ypadding) + ")").call(xAxis).attr("font-family", "sans-serif")
            .attr("font-size", "12px");

        var yAxis = d3.axisLeft().scale(yScale).ticks(7).tickFormat(function (d) {
            return occupations[d];
        });
        svg.append("g").attr("transform", "translate(" + xpadding * 5 + ", 0)").call(yAxis).attr("font-family", "sans-serif")
            .attr("font-size", "12px");
    }
}