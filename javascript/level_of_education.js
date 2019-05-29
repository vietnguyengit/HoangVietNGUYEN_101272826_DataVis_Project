var occupations = [];
var subchart = false;
var tooltip;
var svg;

var level_of_education_CSV_converter = function(d) {
    return {
        post_graduate: +d["post_graduate"],
        bachelor: +d["bachelor"],
        diploma: +d["diploma"],
        certificate: +d["certificate"],
        year_12: +d["year_12"],
        years_11_and_10: +d["years_11_and_10"],
        below_year_10: +d["below_year_10"],
        occupation: d.occupation
    };
};

function hide_level_of_education() {
    //just to reset previous prints
    d3.select("#level_of_education_title").select("h4").remove();
    d3.select("#level_of_education").select("svg").remove();
    if (!subchart) {
        d3.select("#level_of_education_legend").select("svg").remove();
        d3.select("#level_of_education_details").select("div").remove()
    }
}

function level_of_education() {
    var dataset = [];
    var attributes = ["post_graduate", "bachelor", "diploma", "certificate", "year_12", "years_11_and_10", "below_year_10"];
    var colors = d3.scaleOrdinal().range(["#ffc001", "#70ad47", "#4471c4", "#5b9bd5", "#a4a4a4", "#25867e", "#ed7d31"]);
    //import dataset
    d3.csv("data/job_outlook.csv", level_of_education_CSV_converter, function (data) {
        dataset = data;
        stacked_bars(dataset, attributes, colors);
    });
}

function drawTooltip() {
    // Prep the tooltip bits, initial display is hidden
    tooltip = svg.append("g")
        .attr("class", "tooltip")
        .style("display", "none");

    tooltip.append("rect")
        .attr("x", -30)
        .attr("width", 60)
        .attr("height", 20)
        .attr("fill", "white")
        .style("opacity", 0.8)
        .style("stroke", "black")
        .style("stroke-width", 0.25);;

    tooltip.append("text")
        .attr("x", 0)
        .attr("dy", "1.2em")
        .style("text-anchor", "middle")
        .style('fill', 'black')
        .attr("font-size", "12px")
        .attr("font-weight", "bold");
}

function print_options() {

    d3.select("#level_of_education_details")
        .append("div")
        .attr("id", "level_of_education_options");

    for (var i = occupations.length; i >= 0; i--) {

        d3.select("#level_of_education_options").append("input").attr("type", "radio")
            .attr("name", "occupation").attr("value", i)
            .attr("onchange", "return get_value('occupation');");

        if (i < occupations.length) {
            d3.select("#level_of_education_options").append("label")
                .attr("for", occupations[i]).text(" " + occupations[i]);
        }
        else {
            d3.select("input").attr("checked", true).attr("onchange", "return get_value('occupation');");
            d3.select("#level_of_education_options").append("label")
                .attr("for", i).text(" " + "All occupations");
        }

        d3.select("#level_of_education_options").append("br");
    }
}

function get_value(keyword) {

    var data = document.getElementsByName(keyword);
    var option;

    //assign value
    for (var i = 0; i < data.length; i++) {
        if (data[i].checked) {
            option = data[i].value;
        }
    }

    var dataset = [];
    //import dataset
    d3.csv("data/job_outlook.csv", level_of_education_CSV_converter, function (data) {

        dataset = data;
        if (option < 5) {
            subchart = true;
            subCircleChart(option, dataset);
        } else {
            subchart = true;
            level_of_education();
        }

        subchart = false;
    });
}

function subCircleChart(option, dataset) {

    //just to reset previous prints
    hide_level_of_education();

    var w = 300;
    var h = 300;

    var pie_dataset = Object.values(dataset[option]).slice(0, 7);

    console.log(pie_dataset);

    var outerRadius = w/2;
    var innerRadius = 0;

    var arc = d3.arc().outerRadius(outerRadius).innerRadius(innerRadius);
    var pie = d3.pie();

    svg = d3.select("#level_of_education")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

    //setup the SVG & arcs
    var arcs = svg.selectAll("g.arc")
        .data(pie(pie_dataset))
        .enter()
        .append("g")
        .attr("class", "arc")
        .attr("transform", "translate(" + outerRadius + "," + outerRadius + ")");

    // Prep the tooltip bits, initial display is hidden
    drawTooltip();
    d3.select("#level_of_education_title").append("h4").text("Education Levels (% share) - " + Object.values(dataset[option])[7]);
    var colors = d3.scaleOrdinal().range(["#ffc001", "#70ad47", "#4471c4", "#5b9bd5", "#a4a4a4", "#25867e", "#ed7d31"]);

    //draw the arcs
    arcs.append("path")
        .attr("fill", function(d, i) {
            return colors(i);
        })
        .transition()
        .delay(function(d, i) {
            return i/pie_dataset.length * 500;
        })
        .duration(500)
        .attr("d", function(d, i) {
            return arc(d, i);
        });

    arcs.on("mouseover", function() {
            tooltip.style("display", null);
        })
        .on("mouseout", function(d, i) {
            tooltip.style("display", "none");
        })
        .on("mousemove", function(d, i) {

            var xPosition = d3.mouse(this)[0] + 150;
            var yPosition = d3.mouse(this)[1] + 125;

            tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
            tooltip.select("text").text(d.value.toFixed(2) + "%");
        });
}

function stacked_bars(dataset, attributes, colors) {

    //remove previous prints
    hide_level_of_education();

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

    //yScale
    var yScale = d3.scaleBand().domain(d3.range(dataset.length)).paddingInner(0.5).rangeRound([h - ypadding, ypadding]);

    //Create SVG element
    svg = d3.select("#level_of_education").append("svg").attr("width", w).attr("height", h);

    // Add a group for each row of data
    var groups = svg.selectAll("g").data(series).enter().append("g").style("fill", function (d, i) {
        return colors(i);
    });

    drawTooltip();

    d3.select("#level_of_education_title").append("h4").text("Education Levels (% share) all occupations");

    // Add a rect for each data value
    var rects = groups.selectAll("rect")
        .data(function (d, i) {
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
        .on("mouseover", function() { tooltip.style("display", null); })
        .on("mouseout", function(d, i) {
            d3.select(this).attr("fill", colors[i]);
            tooltip.style("display", "none");
        })
        .on("mousemove", function(d, i) {

            d3.select(this).attr("fill", "red");

            var xPosition = d3.mouse(this)[0] - 15;
            var yPosition = d3.mouse(this)[1] - 25;
            tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
            tooltip.select("text").text((d[1] - d[0]).toFixed(2) + "%");
        })
        .transition()
        .delay(function(d, i) {
            return i/dataset.length * 600;
        })
        .duration(500)
        .ease(d3.easeElasticOut)
        .attr("width", function (d, i) {
            return xScale(d[1]) - xScale(d[0]);
        })
        .attr("height", yScale.bandwidth());

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

    var inner = d3.select("#level_of_education_legend").append("svg").attr("width", w).attr("height", 150);
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
        .attr("transform", "translate(" + xpadding * 3.5 + ", 20)");

    var legend_attributes = ["Post Graduate", "Bachelor", "Diploma", "Certificate", "Year 12", "Years 11 & 10", "Below year 10"];
    legend.append("text")
        .attr("class", "label")
        .attr("y", function (d, i) {
            return i * legspacing;
        })
        .attr("x", 85)
        .attr("text-anchor", "start")
        .text(function (d, i) {
            return legend_attributes[i];
        }).attr("font-family", "sans-serif")
        .attr("font-size", "12px")
        .attr("transform", "translate(" + xpadding * 3.5 + ", 20)");

    print_options();
}