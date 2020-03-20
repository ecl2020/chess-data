function makemap() {
    var width = 960,
        height = 1160;

    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

    // using the Eckert III projection
    var projection = d3.geoEckert3()
    // clipping out Antarctica and some of the Pacific
    projection.clipExtent([[70, 0], [960, 400]])
    // .scale(0.5)
    // .translate([width / 2, height / 2])
    var path = d3.geoPath().projection(projection)

    var tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("opacity", 0)
        .text("a simple tooltip")

    // var projection = d3.geoMercator()
    // var path = d3.geoPath().projection(projection);
    d3.json("https://raw.githubusercontent.com/ecl2020/chess-data/master/data/TM_WORLD_BORDERS-0.3.json",
        function (error, borders) {
            if (error) return console.error(error)
            var countries = topojson.feature(borders, borders.objects.BORDERS)
            var colors = d3.scaleLinear()
                .domain([d3.min(countries.features, d => d.properties.AREA),
                d3.max(countries.features, d => d.properties.AREA)])
                .range(['#33e5b5', '#33b5e5'])
            svg.append("g")
                .selectAll("path")
                .data(countries.features)
                .enter()
                .append("path")
                .attr("d", path)
                .style("fill", function (d) {
                    return colors(d.properties.AREA)
                })
                .on('mouseover', function (d) {
                    tooltip.text(d.properties.NAME)
                    console.log(d.properties.NAME)
                })
                .on('mousemove', function (d) {
                    tooltip.transition()
                        .duration(50)
                        .style("opacity", 1)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY) + "px");
                })

                .on("mouseout", function (d) {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                })
        })

    d3.csv("https://raw.githubusercontent.com/ecl2020/chess-data/master/data/FIDE/jan1975fed.csv",
        function (error, data) {
            if (error) throw console.error(error)
            console.log(data[0])
        })
}
