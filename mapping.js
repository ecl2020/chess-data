function makemap() {
    var width = 960,
        height = 1160;

    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

    // using the Eckert III projection
    var projection = d3.geoEckert3()
    // clipping Antarctica out 
    projection.clipExtent([[70, 0], [960, 400]])
    // .scale(0.5)
    // .translate([width / 2, height / 2])
    var path = d3.geoPath().projection(projection)

    var colors = d3.scaleLinear()
        .domain(['AAA', 'ZZZ'])
        .range(['#33b5e5', '#33e5b5'])

    // var projection = d3.geoMercator()
    // var path = d3.geoPath().projection(projection);
    d3.json("https://raw.githubusercontent.com/ecl2020/chess-data/master/data/TM_WORLD_BORDERS-0.3.json",
        function (error, borders) {
            if (error) return console.error(error)
            var countries = topojson.feature(borders, borders.objects.BORDERS)
            for (var i = 0; i < countries.features.length; i++) {
                // console.log('ISO3: ', countries.features[i].properties.ISO3)
            }
            svg.append("g")
                .selectAll("path")
                .data(countries.features)
                .enter()
                .append("path")
                .attr("d", path)
                .style("fill", "#33b5e5")
        })
}
