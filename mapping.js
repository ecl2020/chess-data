function getData(json, property){
    return json.properties[property]
}

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
            var year = document.getElementById('yearRange').value
            var countries = topojson.feature(borders, borders.objects.BORDERS)

            for (var i = 0; i < countries.features.length; i++) {
                attachData(countries.features[i], year, countries.features[i].properties.ISO3)
            }

            for (var i = 0; i < countries.features.length; i++) {
                console.log(countries.features[i])
                console.log(countries.features[i].properties.NAME, countries.features[i].properties['playerCount'])

            }

            var colors = d3.scaleLinear()
                .domain([0, d3.max(countries.features, d => d.properties.playerCount)])
                .range(['#33e5b5', '#33b5e5'])

            svg.append("g")
                .selectAll("path")
                .data(countries.features)
                .enter()
                .append("path")
                .attr("d", path)
                .attr("id", function (d) { return d.properties.NAME })
                .style("fill", function (d) {
                    return colors(d.properties.playerCount)
                })
                .on('mouseover', function (d) {
                    d3.select(this).style('fill', 'orange')
                    tooltip.text(
                        d.properties.NAME,
                        d.properties.playerCount
                    )
                })
                .on('mousemove', function (d) {
                    tooltip.transition()
                        .duration(50)
                        .style("opacity", 1)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY) + "px");
                })

                .on("mouseout", function (d) {
                    d3.select(this).style("fill", function (d) {
                        return colors(d.properties.playerCount)
                    })
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                })
        })
}

function updateSlider() {
    var year = document.getElementById('yearRange').value
    var output = document.getElementById('year-display')
    output.innerHTML = year
}

function attachData(json, year, country) {
    d3.csv("https://raw.githubusercontent.com/ecl2020/chess-data/master/data/weeks_data/" + String(year) + "withISO.txt",
        function (error, data) {
            if (error) throw console.error(error)
            var playerCount = 0
            var rating = 0
            var ratingName = ""
            var rank = 100000
            var rankName = ""
            for (var i = 0; i < data.length; i++) {
                if (data[i].ISO3 == country) {
                    playerCount += 1
                    if (data[i].Rating > rating) {
                        rating = data[i].Rating
                        ratingName = data[i].Name
                    }
                    if (data[i].Rank < rank) {
                        rank = data[i].Rank
                        rankName = data[i].Name
                    }
                }
            }
            json.properties.rank = rank
            json.properties.rating = rating
            json.properties.rankName = rankName
            json.properties.ratingName = ratingName
            json.properties.playerCount = playerCount
        })
}

function mapHighlight(id) {

}