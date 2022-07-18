var line_margin = { top: 50, right: 50, bottom: 50, left: 50 },
    line_width = d3.select("#line_block").node().getBoundingClientRect().width - line_margin.left - line_margin.right,
    line_height = 400 - line_margin.top - line_margin.bottom;

var line_svg = d3.select("#line_block")
    .append("svg")
    .attr("width", line_width + line_margin.left + line_margin.right)
    .attr("height", line_height + line_margin.top + line_margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + line_margin.left + "," + line_margin.top + ")");


year_now = new Date().getFullYear()
year_now = +year_now

var line_x = d3.scaleBand()
    .domain(d3.extent([2000, year_now], function(d) {
        date = d3.timeParse("%Y")(d)
        return date.getFullYear();
    }))
    .range([0, line_width])

line_svg.append("g")
    .attr("class", "myXaxis")
    .attr("transform", "translate(0," + line_height + ")")
    .call(d3.axisBottom(line_x).ticks(window.innerWidth / 150))



var line_y = d3.scaleLinear()
    .domain([0, d3.max([0, 100], function(d) { return +d; })])
    .range([line_height, 0]);

line_svg.append("g")
    .attr("class", "myYaxis")
    .call(d3.axisLeft(line_y));



function getLineChart(data, countryList) {

    var sumstat = d3.nest()
        .key(function(d) {
            return d.country;
        })
        .entries(data);

    var res = sumstat.map(function(d) {
        return d.key
    })

    var color = d3.scaleOrdinal()
        .domain(res)
        .range(['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf', '#999999', "#a6cee3",
            "#1f78b4",
            "#b2df8a",
            "#33a02c",
            "#fb9a99",
            "#e31a1c",
            "#fdbf6f",
            "#ff7f00",
            "#cab2d6",
            "#6a3d9a",
            "#ffff99",
            "#b15928"
        ])

    var testFilter = data.filter(function(d) { return d.country == res[0] });

    var line_group = line_svg.selectAll(".group")
        .data(sumstat)
        .enter()
        .append("g")
        .attr("class", "group");

    var line_x = d3.scaleBand()
        .domain(d3.extent(testFilter, function(d) {
            return d.year;
        }))
        .range([0, line_width])

    line_svg.append("g")
        .attr("class", "myXaxis")
        .attr("transform", "translate(0," + line_height + ")")
        .call(d3.axisBottom(line_x).ticks(window.innerWidth / 150))

    var arr = []
    testFilter.forEach(function(d) {
        arr.push(+d.value)
    })

    var line_y = d3.scaleLinear()
        .domain([0, d3.max(arr)])
        .range([line_height, 0]);

    line_svg.append("g")
        .attr("class", "myYaxis")
        .call(d3.axisLeft(line_y));

    line_svg.selectAll(".myXaxis")
        .transition()
        .duration(500)
        .call(d3.axisTop(line_x));

    var linepath = d3.line()
        .x(function(d) {
            return line_x(d.year);
        })
        .y(function(d) { return line_y(d.value); });


    line_group.append("path")
        .attr("class", "line")
        .attr("d", function(d) {
            return linepath(d.values);
        })
        .attr("fill", "none")
        .style("stroke", function(d) {
            return color(d.key);
        });

    legend_block = document.getElementById('legend_block')

    try {
        while (legend_block.firstChild) {
            legend_block.removeChild(legend_block.lastChild);
        }
    } catch {}


    countryList.forEach(country => {
        legendElement = document.createElement('div');
        colorSquare = document.createElement('div');
        legendText = document.createElement('p');
        legendText.innerHTML = country.geoAreaName
        colorSquare.style.cssText = "height: 10px; width: 10px; background-color:" + color(country.geoAreaName) + ";"
        legendElement.style.cssText = "display: grid; grid-template-columns: 1fr 95%; align-items: center;"
        legend_block.style.cssText = "display: grid; grid-template-columns: repeat(" + countryList.length + ", 1fr); grid-gap: 10px;"
        legend_block.appendChild(legendElement)
        legendElement.appendChild(colorSquare)
        legendElement.appendChild(legendText)

    })

    function filteredData() {

        console.log("filteredData()")

        var circles = line_svg.selectAll("circle")

        circles
            .remove()

        var linepath = d3.line()
            .x(function(d) {
                return line_x(d.year);
            })
            .y(function(d) { return line_y(d.value); });

        countries = []
        countryList.forEach(function(d) {
            idss = d.geoAreaName.toString()
            cidss = idss.replace(/\s/g, '')
            var cbb = document.querySelector('#' + cidss);
            if (cbb.checked == true) {
                countries.push(cbb.value)
                    //console.log(countries)
            } else {
                countries.filter((n) => { return n != cbb.value.toString() })
            }
        })

        var select = document.getElementById('dimention_block');
        var selectedOption = select.options[select.selectedIndex].text;
        console.log(selectedOption)
        listOfValues = selectedOption.split(', ')
        actualParameters = []
        listOfValues.forEach(elem => {
            par = elem.split(":")
            actualParameters.push({
                name: par[0].trim(),
                value: par[1].trim()
            })
        })

        console.log(actualParameters)



        dataFilteredCountry = data.filter(function(e) {
            if (countries.includes(e.geoAreaCode) && e.value != "NaN") { return e } else {}
        })

        dataFiltered = dataFilteredCountry.filter(function(e) {
            selectorOne = []
            selectorTwo = []
            actualParameters.forEach(function(param) {
                for (const [key, value] of Object.entries(e.dimensions)) {
                    // console.log(key + ": " + value)
                    if (key == param.name && value == param.value) {
                        // console.log(key + ", " +
                        //     param.name + ": " + value + ", " + param.value)
                        selectorOne.push(value)
                        selectorTwo.push(param.value)
                    } else {}
                }
            })
            if (selectorOne.length == actualParameters.length) {
                return e;
            } else {}

        });

        console.log(dataFiltered)

        var unique_years = []

        dataFiltered.forEach((d) => {
            // console.log(d.year)
            if (unique_years.includes(d.year)) {

            } else { unique_years.push(d.year) }
        })

        console.log(unique_years.sort())

        var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
            .key(function(d) {
                return d.country;
            })
            .entries(dataFiltered);

        var arr = []
        dataFiltered.forEach(function(d) {
            arr.push(+d.value)
        })


        var color = d3.scaleOrdinal()
            .domain(sumstat)
            .range(['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf', '#999999', "#a6cee3",
                "#1f78b4",
                "#b2df8a",
                "#33a02c",
                "#fb9a99",
                "#e31a1c",
                "#fdbf6f",
                "#ff7f00",
                "#cab2d6",
                "#6a3d9a",
                "#ffff99",
                "#b15928"
            ])

        var line_y = d3.scaleLinear()
            .domain([0, d3.max(arr)])
            .range([line_height, 0]);


        var line_x = d3.scaleBand()
            .domain(unique_years.sort(d3.ascending))
            .range([0, line_width]);

        line_svg.selectAll(".myYaxis")
            .transition()
            .duration(500)
            .call(d3.axisLeft(line_y))


        line_svg.selectAll(".myXaxis")
            .transition()
            .duration(500)
            .call(d3.axisBottom(line_x));


        line_svg.selectAll(".group")
            .remove();

        var line_group = line_svg.selectAll(".group")
            .data(sumstat)
            .enter()
            .append("g")
            .attr("class", "group");


        line_group.append("path")
            .attr("class", "line")
            .transition()
            .duration(500)
            .attr("d", function(d) {
                return linepath(d.values);
            })
            .attr("fill", "none")
            .style("stroke", function(d) {
                return color(d.key);
            })
            .style("stroke-width", "4px")



        var tooltip = d3.select("#line_block")
            .append("div")
            .data(dataFiltered)
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("padding", "10px")


        var mouseover = function(d) {
            vLines
                .style("opacity", 0)

            text = []

            tooltip
                .style("opacity", 1)
                .style("left", (d3.mouse(this)[0] + 90) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
                .style("top", (d3.mouse(this)[1]) + "px")
                .html(function() {
                    var selected = d3.selectAll(".cl" + d)
                    selected._groups.forEach(nodeList => {
                        nodeList.forEach(d => {
                            if (d.nodeName == "circle") {
                                text.push({
                                    country: d.__data__.country,
                                    value: d.__data__.value,
                                    year: d.__data__.year
                                })
                            } else {}
                        })
                    })
                    bar_update(text)
                    getMap(text)
                    return JSON.stringify(text)
                })
        }

        var mousemove = function(d) {

            vLines
                .style("opacity", 0)

            text = []
            barData = []

            tooltip
                .style("opacity", 1)
                .style("left", (d3.mouse(this)[0] + 90) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
                .style("top", (d3.mouse(this)[1]) + "px")
                .html(function() {
                    var yearPlaceholder = document.getElementById('yearPlaceholder')
                    try {
                        while (yearPlaceholder.firstChild) {
                            yearPlaceholder.removeChild(yearPlaceholder.lastChild);
                        }
                    } catch {}

                    year = document.createElement('h3');
                    year.innerHTML = "Year: " + d
                    yearPlaceholder.appendChild(year)

                    var selected = d3.selectAll(".cl" + d)
                    selected._groups.forEach(nodeList => {
                        nodeList.forEach(d => {
                            // for (var i = 0; i < selected.length; i++) {
                            // console.log(d)
                            if (d.nodeName == "circle") {
                                // console.log(d)
                                barData.push({
                                    country: d.__data__.country,
                                    value: d.__data__.value,
                                    year: d.__data__.year
                                })

                                text.push({
                                    country: d.__data__.country,
                                    value: d.__data__.value,
                                    year: d.__data__.year
                                })
                            } else {}
                        })
                    })
                    bar_update(barData)
                    console.log(barData)
                    getMap(barData)

                    // text = JSON.stringify(text)
                    string = ""
                    text.forEach(elem => {
                        // console.log(elem)
                        string = string + elem.country + " " + elem.value + "<br>"
                    })
                    return "<b>Year: " + d + "</b><br>" + string
                })
        }

        var mouseleave = function(d) {

            tooltip
                .transition()
                .duration(200)
                .style("opacity", 0)
        }

        var circles = line_svg.append('g')
            .selectAll("dot")
            .data(dataFiltered)
            .enter()
            .append("circle")
            .attr("class", function(d) { return "cl" + d.year + " circle" })
            .attr("cx", function(d) { return line_x(d.year); })
            .attr("cy", function(d) { return line_y(d.value); })
            .attr("r", 2)
            .style("fill", function(d) {
                // console.log(d)
                return color(d.country);
            })
            .style('r', "5px")
            .style("opacity", 1)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)

        var vLines = line_svg.selectAll("rect")
            .data(unique_years)

        vLines
            .enter()
            .append("rect")
            .merge(vLines)
            .transition(1) // and apply changes to all of them
            .duration(1)
            .attr("class", function(d) {
                return "cl" + d
            })
            .attr('x', function(d) {
                return line_x(d) - (line_width / unique_years.length) / 2
            })
            .attr('y', 0)
            .attr('width', function() {
                return line_width / unique_years.length
            })
            .attr('height', line_height)
            .style("stroke", "red")
            .style("opacity", 0)
            .style("fill", "Gray")
            .style('fill-opacity', 0)

        vLines
            .exit()
            .remove()

        console.log(vLines)

        var vLines = line_svg.selectAll("rect")
        vLines
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)



        var barData = dataFiltered.filter(function(d) {
            return d.year == d3.max(dataFiltered, function(d) {
                return d.year
            })
        })

        bar_update(barData)
        getMap(barData)

        var yearPlaceholder = document.getElementById('yearPlaceholder')
        try {
            while (yearPlaceholder.firstChild) {
                yearPlaceholder.removeChild(yearPlaceholder.lastChild);
            }
        } catch {}

        year = document.createElement('h3');
        year.innerHTML = "Year: " + d3.max(dataFiltered, function(d) {
            return d.year
        })
        yearPlaceholder.appendChild(year)
    }
    filteredData()

    d3.select("#dimention_block").on("click", function(d) {
        filteredData()
    })

    var deSelectAllButton = document.querySelector('#deSelectAllButton')
    deSelectAllButton.addEventListener('click', (event) => {
        filteredData()
    })

    var selectAllButton = document.querySelector('#selectAllButton')
    selectAllButton.addEventListener('click', (event) => {
        filteredData()
    })

    var menaSelectButton = document.querySelector('#menaSelectButton')
    menaSelectButton.addEventListener('click', (event) => {
        filteredData()
    })

    countryList.forEach(function(d) {
        ids = d.geoAreaName.toString()
        cids = ids.replace(/\s/g, '')
        var cb = document.querySelector('#' + cids);
        cb.addEventListener('click', (event) => {
            filteredData()
        })
    })
}