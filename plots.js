// set the dimensions and margins of the graph
var margin = { top: 10, right: 30, bottom: 30, left: 60 },
    width = 860 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var svg = d3.select("#cmr_plot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)

d3.tsv("https://raw.githubusercontent.com/ecl2020/chess-data/master/data/cmr.txt", function (error, data) {
    if (error) throw error;
    data.forEach(function (d) {
        name = +d.Name;
        rating = +d.Rating;
        year = +d.Year;
    })
    console.log(data[0])
    console.log(data[30])
    var x = d3.scaleLinear()
        .domain([d3.min(data, d => d.Year), d3.max(data, d => d.Year)])
        .range([10, width - 10]);

    var y = d3.scaleLinear()
        .domain([d3.min(data, d => d.Rating), d3.max(data, d => d.Rating)])
        .range([height - 10, 10])

    var x_axis = d3.axisBottom()
        .tickFormat(d3.format("d"))
        .scale(x);

    var y_axis = d3.axisLeft()
        .scale(y)

    svg.append("g")
        .attr("transform", "translate(50, 10)")
        .call(y_axis)

    var xAxisTranslate = height - 10;

    svg.append("g")
        .attr("transform", "translate(50, " + xAxisTranslate + ")")
        .call(x_axis)

    var div = d3.select("#cmr_plot").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    svg.selectAll('circle').data(data)
        .enter().append('circle')
        .attr('cx', function (d) { return x(d.Year) + 50})
        .attr('cy', function (d) { return y(d.Rating) })
        .attr('r', 1.5)
        .style('fill', "#33b5e5")
        .on('mouseover', function (d, i) {
            d3.select(this).transition()
                .duration('50')
                .attr('opacity', '.85');
            div.transition()
                .duration(50)
                .style("opacity", 1);
            div.html(d.Name)
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 15) + "px");
        })
        .on('mouseout', function (d, i) {
            d3.select(this).transition()
                .duration('50')
                .attr('opacity', '1');
            div.transition()
                .duration('50')
                .style("opacity", 0);
        });

    svg.append("text")
        .attr("x", (width / 2) + 50)
        .attr("y", 10)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text("ChessMetrics Ratings")

})



