var occupations = [];
var subchart_ageProfiles = false;
var tooltip;
var svg;

var age_profiles_CSV_converter = function(d) {
    return {
        "15-19": +d["15-19"],
        "20-24": +d["20-24"],
        "25-34": +d["25-34"],
        "35-44": +d["35-44"],
        "45-54": +d["45-54"],
        "55-59": +d["55-59"],
        "60-64": +d["60-64"],
        "65_and_over": +d["65_and_over"],
        occupation: d.occupation
    };
};

function hide_age_profiles() {
    //just to reset previous prints
    d3.select("#age_profiles_title").select("h4").remove();
    d3.select("#age_profiles").select("svg").remove();
    if (!subchart_ageProfiles) {
        d3.select("#age_profiles_legend").select("svg").remove();
        d3.select("#age_profiles_details").select("div").remove()
    }
}

function age_profiles() {
    var dataset = [];
    var attributes = ["15-19", "20-24", "25-34", "35-44", "45-54", "55-59", "60-64", "65_and_over"];
    var colors = d3.scaleOrdinal().range(["#ffc001", "#70ad47", "#4471c4", "#5b9bd5", "#a4a4a4", "#25867e", "#ed7d31", "#2F4F4F"]);
    //import dataset
    d3.csv("data/job_outlook.csv", age_profiles_CSV_converter, function (data) {
        dataset = data;
        ageProfile_stackedBars(dataset, attributes, colors);
    });
}

function ageProfiles_drawTooltip() {
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

function print_age_profiles_options() {

    d3.select("#age_profiles_details")
        .append("div")
        .attr("id", "age_profiles_options");

    for (var i = occupations.length; i >= 0; i--) {

        d3.select("#age_profiles_options").append("input").attr("type", "radio")
            .attr("name", "ap_occupation").attr("value", i)
            .attr("onchange", "return ageProfile_getValue('ap_occupation');");

        if (i < occupations.length) {
            d3.select("#age_profiles_options").append("label")
                .attr("for", occupations[i]).text(" " + occupations[i]);
        }
        else {
            d3.select("#age_profiles_options").select("input").attr("checked", true)
                .attr("onchange", "return ageProfile_getValue('ap_occupation');");
            d3.select("#age_profiles_options").append("label")
                .attr("for", i).text(" " + "All occupations");
        }

        d3.select("#age_profiles_options").append("br");
    }
}

function ageProfile_getValue(keyword) {

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
    d3.csv("data/job_outlook.csv", age_profiles_CSV_converter, function (data) {

        dataset = data;
        if (option < 5) {
            subchart_ageProfiles = true;
            ageProfile_pie(option, dataset);
        } else {
            subchart_ageProfiles = true;
            age_profiles();
        }
        subchart_ageProfiles = false;
    });
}

function ageProfile_pie(option, dataset) {

    //just to reset previous prints
    hide_age_profiles();

    var w = 350;
    var h = 350;

    var pie_dataset = Object.values(dataset[option]).slice(0, 8);

    var outerRadius = w/2;
    var innerRadius = 0;

    var arc = d3.arc().outerRadius(outerRadius).innerRadius(innerRadius);
    var pie = d3.pie();

    svg = d3.select("#age_profiles")
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
    d3.select("#age_profiles_title").append("h4").text("Age profiles (% share) - " + Object.values(dataset[option])[8]);
    var colors = d3.scaleOrdinal().range(["#ffc001", "#70ad47", "#4471c4", "#5b9bd5", "#a4a4a4", "#25867e", "#ed7d31", "#2F4F4F"]);

    //draw the arcs
    arcs.append("path")
        .attr("fill", function(d, i) {
            return colors(i);
        })
        .transition()
        .delay(function(d, i) {
            return i/pie_dataset.length * 500;
        })
        .ease(d3.easeCircle)
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

            var xPosition = d3.mouse(this)[0] + 175;
            var yPosition = d3.mouse(this)[1] + 150;

            tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
            tooltip.select("text").text(d.value.toFixed(2) + "%");
        });
}

function ageProfile_stackedBars(dataset, attributes, colors) {

    //remove previous prints
    hide_age_profiles();

    var w = 850;
    var h = 350;

    var xpadding = 60;
    var ypadding = 20;

    var stack = d3.stack().keys(attributes);

    var series = stack(dataset);

    //xScale
    var xScale = d3.scaleLinear().domain([0, 100]).rangeRound([xpadding * 5, w - xpadding]);

    //yScale
    var yScale = d3.scaleBand().domain(d3.range(dataset.length)).paddingInner(0.5).rangeRound([h - ypadding, ypadding]);

    //Create SVG element
    svg = d3.select("#age_profiles").append("svg").attr("width", w).attr("height", h);

    // Add a group for each row of data
    var groups = svg.selectAll("g").data(series).enter().append("g").style("fill", function (d, i) {
        return colors(i);
    });

    drawTooltip();

    d3.select("#age_profiles_title").append("h4").text("Age profiles (% share) all occupations");

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

    var inner = d3.select("#age_profiles_legend").append("svg").attr("width", w).attr("height", 160);
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

    var legend_attributes = ["15 to 19", "20 to 24", "25 to 34", "35-44", "45 to 54", "55 to 59", "60 to 64", "65 and over"];;
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

    print_age_profiles_options();
}