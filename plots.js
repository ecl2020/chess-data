function bounds(max) {
    return [max * 0.05, max - (max * 0.05)]
}


function plot(address, plot, plot_title) {
    var margins = { top: $(document).height() * 0.05, bottom: $(document).height() * 0.05 }
    var height = $(document).height() - margins.top;
    var width = $(document).width();

    // var svg = d3.select(#cmr_plot)
    var svg = d3.select(plot).append("svg")
        .attr("width", width)
        .attr("height", height)

    // d3.tsv("https://raw.githubusercontent.com/ecl2020/chess-data/master/data/cmr.txt", function(error, data))
    d3.tsv(address, function (error, data) {
        if (error) throw error;
        data.forEach(function (d) {
            name = +d.Name;
            rating = +d.Rating;
            year = +d.Year;
        })
        console.log(data[40])
        var x = d3.scaleLinear()
            .domain([d3.min(data, d => d.Year), d3.max(data, d => d.Year)])
            // .range(bounds(width))
            .range([10, width - 10]);

        var y = d3.scaleLinear()
            .domain([d3.min(data, d => d.Rating), d3.max(data, d => d.Rating)])
            // .range(bounds(height)[1], bounds(height)[0])
            .range([height - 10, 10])

        var x_axis = d3.axisBottom()
            .tickFormat(d3.format("d"))
            .scale(x);

        var y_axis = d3.axisLeft()
            .scale(y)

        var xAxisTranslate = height - 30;

        svg.append("g")
            .attr("transform", "translate(50, 10)")
            // .attr("transform", "translate(" + bounds(height)[1] + "," + bounds(height)[0] + ")")
            .call(y_axis)

        svg.append("g")
            // .attr("transform", "translate(" + bounds(width) + ")")
            .attr("transform", "translate(40, " + xAxisTranslate + ")").call(x_axis)

        var div = d3.select(plot).append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)

        svg.selectAll('circle').data(data)
            .enter().append('circle')
            .attr('cx', function (d) { return x(d.Year) + 50 })
            .attr('cy', function (d) { return y(d.Rating) })
            .attr('r', 1.5)
            .style('fill', "#33b5e5")
            .on('mouseover', function (d, i) {
                d3.select(this)
                    .attr('r', 4)
                    .style('fill', '33e5b5')
                div.transition()
                    .duration('100')
                    .style("opacity", "1")
                    .style(cursor = "none")
                div.html(d.Name + " was rated " + d.Rating + " in " + d.Year)
                    .style("left", (event.clientX) + "px")
                    .style("top", (event.clientY) + "px")
                    .style("position", "absolute")
                    .style("background-color", "gray")
                    .style("color", "white")
                    .style("padding", "3px")
                    .style("border-radius", "5px")

            })
            .on('mouseout', function (d, i) {
                d3.select(this)
                    .attr('r', 1.5)
                    .style('fill', "#33b5e5")
                div.transition()
                    .duration('100')
                    .style("opacity", "0")
            });

        // svg.append("text")
        //     .attr("x", (width / 2) + 50)
        //     .attr("y", 10)
        //     .attr("text-anchor", "middle")
        //     .style("font-size", "16px")
        //     .style("text-decoration", "underline")
        //     .text(plot_title)

    })
}

function pages(current) {
    var x = document.getElementById("myTable").rows[0].cells;
    var i = 0
    if (current != "home") {
        x[i].innerHTML = '<a href="' + "./index.html" + '">' + "Home" + '</a>';
        i++
    }
    if (current != "hist") {
        x[i].innerHTML = '<a href="' + "./fide_hist.html" + '">' + "Historic FIDE Ratings" + '</a>';
        i++
    }
    if (current != "edo") {
        x[i].innerHTML = '<a href="' + "./edopage.html" + '">' + "Edo Page" + '</a>';
        i++
    }
    if (current != "cmr") {
        x[i].innerHTML = '<a href="' + "./cmrpage.html" + '">' + "CMR" + '</a>';
    }
}

