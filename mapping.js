function makemap() {
    var width = 960,
        height = 450;
    // add the svg canvas
    var svg = d3.select("svg > g")
    if (svg.empty()) {
        var svg = d3.select("body").append("svg")
            .attr("width", width)
            .attr("height", height);
    }
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
        async function (error, borders) {
            if (error) return console.error(error)
            let year = document.getElementById('yearRange').value
            let countries = topojson.feature(borders, borders.objects.BORDERS)

            for (let i = 0; i < countries.features.length; i++) {
                countries.features[i].stats = await getData(year, countries.features[i].properties.ISO3)
            }

            var colors = d3.scaleLinear()
                .domain([0, d3.max(countries.features, d => d.stats.playerCount)])
                .range(['#33e5b5', '#33b5e5'])

            svg.append("g")
                .selectAll("path")
                .data(countries.features)
                .enter()
                .append("path")
                .attr("d", path)
                .attr("id", function (d) { return d.properties.NAME })
                .style("fill", function (d) {
                    if (d.stats.playerCount == 0) {
                        return '#ddd'
                    }
                    else { return colors(d.stats.playerCount) }
                })
                .on('mouseover', function (d) {
                    d3.select(this).style('fill', 'orange')
                    let text = ""
                    if (d.stats.playerCount > 0){
                        text = d.properties.NAME + ": " + d.stats.playerCount + " players." + " Top Player: " + d.stats.ratingName + ", " + d.stats.rating
                    }
                    else{
                        text = d.properties.NAME + ": No Players"
                    }
                    tooltip
                        .text(text)
                })
                .on('mousemove', function (d) {
                    tooltip.transition()
                        .duration(50)
                        .style("opacity", 1)
                        .style("left", (d3.event.pageX - 20) + "px")
                        .style("top", (d3.event.pageY + 20) + "px");
                })
                .on('click', async function (d) {
                    let stat = await getData(year, d.properties.ISO3)
                    // console.log(stat.ratingName)
                    countryPlot(year, d)
                })
                .on("mouseout", function (d) {
                    d3.select(this).style("fill", function (d) {
                        if (d.stats.playerCount == 0) {
                            return '#ddd'
                        }
                        else { return colors(d.stats.playerCount) }
                    })
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                })
        })
}

async function countryPlot(year, country) {
    let data = await getAllData(year, country.properties.ISO3)
    console.log(data)
    var text = country.properties.NAME + data[0].Name + data[0].Rating
    var newpa = document.createElement("p")
    var node = document.createTextNode(text)
    newpa.appendChild(node)
    document.body.append(newpa)
}

function updateSlider() {
    var year = document.getElementById('yearRange').value
    var output = document.getElementById('year-display')
    output.innerHTML = year
    makemap()
}

let dataCache = {}
function getData(year, country) {
    if (dataCache[year]) {
        return new Promise(resolve => resolve(calculate(dataCache[year], country)))
    }
    else {
        return new Promise(resolve => {
            d3.csv("https://raw.githubusercontent.com/ecl2020/chess-data/master/data/weeks_data/" + String(year) + "withISO.txt",
                function (error, data) {
                    if (error) throw console.error(error)
                    dataCache[year] = data
                    resolve(calculate(data, country))
                })
        })
    }
}

let allCache = {}
function getAllData(year, country) {
    if (allCache[country]) {
        return allCache[country];
        // return new Promise(()=> {return allCache[country]})
    }
    return new Promise(() => {
        for (let i = 1975; i < 2001; i++) {
            d3.csv("https://raw.githubusercontent.com/ecl2020/chess-data/master/data/weeks_data/" + String(year) + "withISO.txt",
                function (error, data) {
                    if (error) throw console.error(error)
                    let focus = data.filter(function (d) {
                        return d.ISO3 == country
                    })
                    allCache[country] = focus
                })
            return allCache[country]
        }
    })
}

function calculate(data, country) {
    let playerCount = 0
    let rating = 0
    let ratingName = ""
    let rank = 100000
    let rankName = ""
    for (let i = 0; i < data.length; i++) {
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
    return {
        rank, rankName, rating, ratingName, playerCount
    }
}
