function cap(string) {

    string = string.split('_').join(" ");

    return string.charAt(0).toUpperCase() + string.slice(1);
}

function hide_costofliving(direct, category) {
    //just to reset previous prints
    d3.select("#"+category+"_title").select("h4").remove();
    d3.select("#"+category).select("svg").remove();
    d3.select("#"+category+"_sort").select("button").remove();

    if (direct) {
        d3.select("#"+category+"_details").select("select").remove();
    }
}

//net salary
var salary_attributes = ["monthly_average_net_salary_after_tax"];
var salary_CSV_converter = function(d) {
    return {
        monthly_average_net_salary_after_tax: +d["monthly_average_net_salary_after_tax"],
        city: d.city
    };
};

//renting
var renting_attributes = [ "monthly_rent_1_bedroom_apt_city", "monthly_rent_1_bedroom_apt_outside",
    "monthly_rent_3_bedroom_apt_city",	"monthly_rent_3_bedroom_apt_outside"];
var renting_CSV_converter = function(d) {
    return {
        monthly_rent_1_bedroom_apt_city: +d["monthly_rent_1_bedroom_apt_outside"],
        monthly_rent_1_bedroom_apt_outside: +d["monthly_rent_1_bedroom_apt_outside"],
        monthly_rent_3_bedroom_apt_city: +d["monthly_rent_3_bedroom_apt_city"],
        monthly_rent_3_bedroom_apt_outside: +d["monthly_rent_3_bedroom_apt_outside"],
        city: d.city
    };
};

//bills
var bills_attributes = ["monthly_basic_utilities",	"monthly_internet"];
var bills_CSV_converter = function(d) {
    return {
        monthly_basic_utilities: +d["monthly_basic_utilities"],
        monthly_internet: +d["monthly_internet"],
        city: d.city
    };
};

//transport
var transport_attributes = ["PT_one_way_ticket", "PT_monthly_pass"];
var transport_CSV_converter = function(d) {
    return {
        PT_one_way_ticket: +d["PT_one_way_ticket"],
        PT_monthly_pass: +d["PT_monthly_pass"],
        city: d.city
    };
};

//groceries
var groceries_attributes = ["milk_1L","white_bread_500G","dozen_eggs","white_rice_1KG",
    "chicken_breasts_1KG","beef_1KG","potatoes_1KG","lettuce_1Head","tomatoes_1KG",
    "apples_1KG","oranges_1KG", "bananas_1KG"];
var groceries_CSV_converter = function(d) {
    return {
        milk_1L: +d["milk_1L"],
        white_bread_500G: +d["white_bread_500G"],
        dozen_eggs: +d["dozen_eggs"],
        white_rice_1KG: +d["white_rice_1KG"],
        chicken_breasts_1KG: +d["chicken_breasts_1KG"],
        beef_1KG: +d["beef_1KG"],
        potatoes_1KG: +d["potatoes_1KG"],
        lettuce_1Head: +d["lettuce_1Head"],
        tomatoes_1KG: +d["tomatoes_1KG"],
        apples_1KG: +d["apples_1KG"],
        oranges_1KG: +d["oranges_1KG"],
        bananas_1KG: +d["bananas_1KG"],
        city: d.city
    };
};

//eating
var eating_attributes = ["meal_for_2_inexpensive", "meal_for_2_mid_range","mcdonalds_mcdeal",
    "bottle_coke","bottle_water","regular_coffee"];
var eating_CSV_converter = function(d) {
    return {
        meal_for_2_inexpensive: +d["meal_for_2_inexpensive"],
        meal_for_2_mid_range: +d["meal_for_2_mid_range"],
        mcdonalds_mcdeal: +d["mcdonalds_mcdeal"],
        bottle_coke: +d["bottle_coke"],
        bottle_water: +d["bottle_water"],
        regular_coffee: +d["regular_coffee"],
        city: d.city
    };
};

function print_options(category) {

    var attributes;

    //eating
    if (category === "eating") {
        attributes = eating_attributes;
    }
    //groceries
    if (category === "groceries") {
        attributes = groceries_attributes;
    }
    //transport
    if (category === "transport") {
        attributes = transport_attributes;
    }
    //bills
    if (category === "bills") {
        attributes = bills_attributes;
    }
    //renting
    if (category === "renting") {
        attributes = renting_attributes;
    }
    //salary
    if (category === "salary") {
        attributes = renting_attributes;
    }

    //salary has just one attribute
    if (category !== "salary") {
        var options = "";

        for (var i = 0; i < attributes.length; i++) {
            options += "<option value="+i+">"+cap(attributes[i])+"</option>";
        }

        //print list of options
        document.getElementById(category + "_details").innerHTML = "<select id='"+category+"_options' " +
            "onchange=\"return chartLoader(this.value,\'"+category+"\');\">" +
            options + "</select>";
    }

    chartLoader(0, category);
}

function chartLoader(option, category) {

    var attributes;
    var converter;

    //eating
    if (category === "eating") {
        attributes = eating_attributes;
        converter = eating_CSV_converter;
    }
    //groceries
    if (category === "groceries") {
        attributes = groceries_attributes;
        converter = groceries_CSV_converter;
    }
    //transport
    if (category === "transport") {
        attributes = transport_attributes;
        converter = transport_CSV_converter;
    }
    //bills
    if (category === "bills") {
        attributes = bills_attributes;
        converter = bills_CSV_converter;
    }
    //renting
    if (category === "renting") {
        attributes = renting_attributes;
        converter = renting_CSV_converter;
    }
    //salary
    if (category === "salary") {
        attributes = salary_attributes;
        converter = salary_CSV_converter;
    }

    loadData(category, option, attributes, converter);
}

//load data fro CSV
function loadData(category, option, attributes, converter, file="cost_of_living") {
    d3.csv("data/" + file + ".csv", converter, function (data) {

        //declare and assign values for dataset
        var dataset = [];
        var cities = [];

        for (var i = 0; i < data.length; i++) {
            cities.push(data[i].city);
            dataset.push(Object.values(data[i])[option]);
        }

        //call functions here
        barChar(dataset, category, attributes, option, cities);
    });
}

function sortLoader(option, category) {

    var attributes;
    var converter;

    //eating
    if (category === "eating") {
        attributes = eating_attributes;
        converter = eating_CSV_converter;
    }
    //groceries
    if (category === "groceries") {
        attributes = groceries_attributes;
        converter = groceries_CSV_converter;
    }
    //transport
    if (category === "transport") {
        attributes = transport_attributes;
        converter = transport_CSV_converter;
    }
    //bills
    if (category === "bills") {
        attributes = bills_attributes;
        converter = bills_CSV_converter;
    }
    //renting
    if (category === "renting") {
        attributes = renting_attributes;
        converter = renting_CSV_converter;
    }
    //salary
    if (category === "salary") {
        attributes = salary_attributes;
        converter = salary_CSV_converter;
    }

    load_sort_data(category, option, attributes, converter);
}

var sortOrder = false;

//load data fro CSV
function load_sort_data(category, option, attributes, converter, file="cost_of_living") {
    d3.csv("data/" + file + ".csv", converter, function (data) {
        //declare and assign values for dataset
        sortOrder = !sortOrder;
        
        data.sort(function(a, b) {
            if (sortOrder) {
                return d3.ascending(a[attributes[option]], b[attributes[option]]);
            } else {
                return d3.descending(a[attributes[option]], b[attributes[option]])
            }
        });

        var dataset = [];
        var cities = [];

        for (var i = 0; i < data.length; i++) {
            cities.push(data[i].city);
            dataset.push(Object.values(data[i])[option]);
        }

        //call functions here
        barChar(dataset, category, attributes, option, cities);
    });
}

function now_tooltip(svg) {
    var tooltip;
    // Prep the tooltip bits, initial display is hidden
    tooltip = svg.append("g")
        .attr("class", "tooltip")
        .style("display", "none");

    tooltip.append("rect")
        .attr("width", 80)
        .attr("height", 20)
        .attr("fill", "white")
        .style("opacity", 0.8)
        .style("stroke", "black")
        .style("stroke-width", 0.25);

    tooltip.append("text")
        .attr("x", 40)
        .attr("dy", "1.2em")
        .style("text-anchor", "middle")
        .style('fill', 'black')
        .attr("font-size", "12px")
        .attr("font-weight", "bold");

    return tooltip;
}

function barChar(dataset, category, attributes, option, cities) {

    hide_costofliving(false, category);

    var colors = ["#ffc001", "#70ad47", "#4471c4", "#5b9bd5", "#a4a4a4", "#25867e", "#ed7d31"];

    d3.select("#"+category+"_title").append("h4").text(cap(attributes[option]));

    var w = 850;
    var h = 400;

    var xpadding = 60;
    var ypadding = 20;

    //xScale
    var xScale = d3.scaleBand().domain(d3.range(dataset.length)).paddingInner(0.5).rangeRound([xpadding, w - xpadding]);
    //yScale
    var yScale = d3.scaleLinear().domain([0, d3.max(dataset, function (d) {
        return d;
    })]).rangeRound([h - ypadding, ypadding]);

    //Create SVG element
    var svg = d3.select("#"+category).append("svg").attr("width", w).attr("height", h);

    // Add a group for each row of data
    var groups = svg.selectAll("g")
        .data(dataset);

    var current_color = colors[Math.floor(Math.random() * colors.length)];

    var bars = groups.enter()
        .append("g").style("fill", current_color)
        .append("rect");

    // Prep the tooltip bits, initial display is hidden
    var tooltip = now_tooltip(svg);

    bars
        .attr("x", function (d, i) {
            return xScale(i);
        })
        .attr("y", function (d, i) {
            return yScale(d);
        })
        .merge(bars)
        .on("mouseover", function() {
            tooltip.style("display", null);
        })
        .on("mouseout", function(d, i) {
            d3.select(this).attr("fill", current_color);
            tooltip.style("display", "none");
        })
        .on("mousemove", function(d, i) {

            d3.select(this).attr("fill", "#778899");

            var xPosition = d3.mouse(this)[0] - 15;
            var yPosition = d3.mouse(this)[1] - 25;

            tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
            tooltip.select("text").text("$"+d.toFixed(2));
        })
        .transition()
        .delay(function(d, i) {
            return i/dataset.length * 500;
        })
        .duration(300)
        .ease(d3.easeCircleOut)
        .attr("height", function (d) {
            return h - ypadding - yScale(d);
        })
        .attr("width", xScale.bandwidth());

    //Adding the Axises
    var xAxis = d3.axisBottom().scale(xScale).ticks(9).tickFormat(function (d) {
        return cities[d];
    });
    svg.append("g").attr("transform", "translate(0, " + (h - ypadding) + ")").call(xAxis).attr("font-family", "sans-serif")
        .attr("font-size", "12px");
    var yAxis = d3.axisLeft().ticks(6).scale(yScale);
    svg.append("g").attr("transform", "translate(" + xpadding + ", 0)").call(yAxis).attr("font-family", "sans-serif")
        .attr("font-size", "12px");

    //short button
    document.getElementById(category + "_sort").innerHTML = "<button type='submit'" +
        "onclick=\"return sortLoader("+option+",\'"+category+"\');\">" +
        "Sort" + "</button>";
}