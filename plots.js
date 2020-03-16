function bounds(max) {
    return [max * 0.05, max - (max * 0.05)]
}

var checked = false
function updateAxis(width, height, padding, data, svg) {
    // console.log(data.length)
    var x = d3.scaleLinear()
        .domain([d3.min(data, d => d.Year), d3.max(data, d => d.Year)])
        .range([padding, width - padding]);

    var y = d3.scaleLinear()
        .domain([d3.min(data, d => d.Rating), d3.max(data, d => d.Rating)])
        .range([height - padding, padding])

    // Add the x Axis
    var x_axis = d3.axisBottom()
        //so the years will not show commas
        .tickFormat(d3.format("d"))
        .scale(x)

    // Add the y Axis
    var y_axis = d3.axisLeft()
        .scale(y)
    if (checked) {
        d3.selectAll($("[class=xaxis]")) // change the x axis
            .transition()
            .duration(1000)
            .call(x_axis);
        d3.selectAll($("[class=yaxis]")) // change the y axis
            .transition()
            .duration(1000)
            .call(y_axis);
    }
    else {
        // build axes
        svg.append("g")
            .transition()
            .duration(1000)
            .attr("class", "xaxis")
            .attr("transform", "translate(0," + (height - padding) + ")")
            .call(x_axis);
        svg.append("g")
            .transition()
            .duration(1000)
            .attr("class", "yaxis")
            .attr("transform", "translate(" + padding + ",0)")
            .call(y_axis);
        checked = !checked
    }
}

// returns all players at or below rank
// compare has value 0 (less than/equal to), 1 (greater than/equal to), or 2 (equal to (# or str))
function rankData(alldata, rank, col, compare) {
    if (compare == 0) {
        var data = alldata.filter(function (d) {
            return parseInt(d[col]) <= rank;
        })
        return data
    }
    else if (compare == 1) {
        var data = alldata.filter(function (d) {
            return parseInt(d[col]) >= rank;
        })
        return data
    }
    else {
        if (typeof alldata[col] === 'number' && isFinite(alldata[col])) {
            var data = alldata.filter(function (d) {
                return parseInt(d[col]) >= rank;
            })
            return data
        }
        else {
            var data = alldata.filter(function (d) {
                return d[col] == rank;
            })
            return data
        }
    }
}

function plot(address, plot, rank) {
    // when the input range changes update value 
    var height = 400 // $(document).height() * 0.65
    var width = $(document).width() * 0.50
    var padding = 40

    var svg = d3.select("svg > g")
    if (svg.empty()) {
        var svg = d3.select(plot).append("svg")
            .attr("class", "oldsvg")
            .attr("width", width)
            .attr("height", height)
    }

    d3.select('svg').onresize = function (event) {
        document.location.reload(true)
    }


    // d3.tsv("https://raw.githubusercontent.com/ecl2020/chess-data/master/data/cmr.txt", function(error, data))
    d3.tsv(address, function (error, alldata) {
        if (error) throw error

        var data = rankData(alldata, rank, "Rank", 0)

        var x = d3.scaleLinear()
            .domain([d3.min(data, d => d.Year), d3.max(data, d => d.Year)])
            .range([padding, width - padding]);

        var y = d3.scaleLinear()
            .domain([d3.min(data, d => d.Rating), d3.max(data, d => d.Rating)])
            .range([height - padding, padding])

        updateAxis(width, height, padding, data, svg)
        updatePointsExplore(height, width, padding, data, plot, rank)
        if (!document.getElementById('savebtn')) {
            var showSaved = document.createElement('input')
            showSaved.type = "button"
            showSaved.id = "savebtn"
            showSaved.value = "Compare Saved Players"
            showSaved.addEventListener('click', function () {
                rank = document.getElementById("nValue").value
                newdata = rankData(alldata, rank, "Rank", 0)
                savedOnly(newdata, plot, rank, width, height, padding, svg)
            })
            document.body.append(showSaved)
        }
        if (!document.getElementById('allbtn')) {
            var showAll = document.createElement('input')
            showAll.id = 'allbtn'
            showAll.type = "button"
            showAll.value = "Show All Players"
            showAll.addEventListener('click', function () {
                updateAxis(width, height, padding, rankData(alldata, rank, "Rank", 0), svg)
                updatePointsExplore(height, width, padding, rankData(alldata, rank, "Rank", 0), plot, rank)
            })
            document.body.append(showAll)
        }
    })
}

function makeTitle(svg, plot_title, x, y, err) {
    if (err) {
        console.log("error")
        svg.append("text")
            .attr("class", "plot_title")
            .attr("x", x)
            .attr("y", y)
            .attr("text-anchor", "start")
            .style("font-size", "12px")
            .style("fill", "darkRed")
            .style("font-family", "Courier")
            .text(plot_title)
    }
    else {
        svg.append("text")
            .attr("class", "plot_title")
            .attr("x", x)
            .attr("y", y)
            .attr("text-anchor", "start")
            .style("font-size", "12px")
            .style("font-family", "Courier")
            .text(plot_title)
    }
}

function hasNumber(myString) {
    return /\d/.test(myString);
}

function savedOnly(data, plot, rank, width, height, padding, svg) {
    var nameList = []
    var tbl = document.getElementById('saved')
    // console.log(tbl)
    var cells = tbl.getElementsByTagName('td')
    for (var i = 3; i < cells.length; i++) {
        if (!hasNumber(cells[i].innerText)) {
            nameList.push(cells[i].innerText)
        }
    }
    // console.log(nameList)
    var named = data.filter(function (d) {
        return nameList.includes(d.Name)
    })
    var rows = document.getElementById('saved').rows;
    var i = rows.length;
    while (--i) {
        rows[i].parentNode.removeChild(rows[i]);
    }
    updateAxis(width, height, padding, named, svg)
    updatePointsExplore(height, width, padding, named, plot, rank)
}

var saved = false
function updatePointsExplore(height, width, padding, data, plot, rank) {
    var x = d3.scaleLinear()
        .domain([d3.min(data, d => d.Year), d3.max(data, d => d.Year)])
        .range([padding, width - padding]);

    var y = d3.scaleLinear()
        .domain([d3.min(data, d => d.Rating), d3.max(data, d => d.Rating)])
        .range([height - padding, padding])
    d3.selectAll("path.line").remove()
    d3.selectAll($("[class=new]")).remove()
    var svg = d3.selectAll('svg')
    var u = svg.selectAll('circle.all').data(data)
    u.enter().append('circle')
        .attr("class", "circle all")
        .merge(u)

        // leaving this in makes it awkward when points are added or taken away. 
        // the "wrong" circles are moved and it can get laggy for large changes
        // .transition()
        // .duration(1000)
        // taking this out means the "correct" circles are removed/added, 
        // but it's done instantly. 

        .attr('cx', function (d) { return x(d.Year) })
        .attr('cy', function (d) { return y(d.Rating) })
        .attr('r', 1.5)
        .style('fill', "#33b5e5")

    u
        .exit()
        .transition() // and apply changes to all of them
        .style("opacity", 0)
        .remove()

    var height = 400 // height for placing the title. Should be defined in terms of svg height.
    var width = 200 // $(document).width() * 0.50

    var div = d3.select(plot).append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("pointerEvents", "none")

    var dataByName = d3.nest()
        .key(function (d) { return d.Name; })
        .entries(data);

    svg.selectAll('circle')
        .on('mouseenter', function (d) {
            d3.selectAll($("[class=plot_title]")).remove()
            d3.selectAll($("[class=new]")).remove()
            d3.selectAll("path.line").remove()
            var current = d.Name
            makeTitle(svg, "click a green point to save " + current, width / 3, height - height * 0.02, false)

            var named = dataByName.filter(function (d) {
                return d.key == current;
            })

            var ratings = d3.values(named).map(function (d) {
                return d.values.map(function (d) { return d.Rating; });
            })[0];
            var years = d3.values(named).map(function (d) {
                return d.values.map(function (d) { return d.Year; });
            })[0];
            var ranks = d3.values(named).map(function (d) {
                return d.values.map(function (d) { return d.Rank; });
            })[0];
            var xy = []; // start empty, add each element one at a time
            // console.log(xy)
            for (var i = 0; i < years.length; i++) {
                xy.push({
                    Year: parseInt(years[i]),
                    Rating: parseInt(ratings[i]),
                    Rank: parseInt(ranks[i])
                }) //, Name: current });
            }
            const circle = svg.selectAll("circle.new")
                .data(xy);
            d3.selectAll($("[class=player-table]")).remove()

            var tbl = newTable('player-table')[0]
            var tbdy = newTable('player-table')[1]
            newRow(tbdy, [current, ""], 'player-cell')
            if (d3.max(xy, d => d.Year) != d3.min(xy, d => d.Year)) {
                newRow(tbdy, ["years in top " + rank,
                xy.length + " (" + d3.min(xy, d => d.Year) + " - " + d3.max(xy, d => d.Year) + ")"], 'player-cell')
            }
            else {
                newRow(tbdy, ["years in top " + rank, xy.length + " (" + d3.max(xy, d => d.Year) + ")"], 'player-cell')
            }
            newRow(tbdy, ["average rating", Math.round(d3.mean(xy, d => d.Rating))], 'player-cell')
            newRow(tbdy, ["highest rating", d3.max(xy, d => d.Rating)], 'player-cell')
            newRow(tbdy, ["top rank", d3.min(xy, d => d.Rank)], 'player-cell')
            if (d3.min(xy, d => d.Rank) == 1) {
                newRow(tbdy, ["years at #1", xy.filter(function (d) {
                    return d.Rank == 1;
                }).length], 'player-cell')
            }
            tbl.appendChild(tbdy);
            document.body.append(tbl)

            circle.enter().append("circle")
                .attr('cx', function (d) { return x(d.Year) })
                .attr('cy', function (d) { return y(d.Rating) })
                .attr("r", 3)
                .attr("class", "new")
                .style('fill', "#33e5b5")
                .on('click', function (d) {
                    // save player
                    var contained = false
                    var tbl = document.getElementById('saved')
                    var cells = tbl.getElementsByTagName('td')
                    if (saved) {
                        for (var i = 0; i < cells.length; i++) {
                            if (cells[i].innerText == current) {
                                contained = true
                            }
                        }
                        saved = true
                    }
                    if (!contained) {
                        var tbdy = document.getElementById('saved').tBodies[0]
                        var text = [
                            current,
                            parseInt(Math.round(d3.mean(xy, d => d.Rating))),
                            parseInt(d3.max(xy, d => d.Rating)),
                            parseInt(d3.min(xy, d => d.Rank))]
                        newRow(tbdy, text, 'saved-player')
                        d3.selectAll($("[class=plot_title]")).remove()
                        makeTitle(svg, "saved " + current, width / 3, height - height * 0.02, false)
                        saved = true
                    }
                    else {
                        d3.selectAll($("[class=plot_title]")).remove()
                        makeTitle(svg, current + " already saved.", width / 3, height - height * 0.02, true)
                    }
                })

            var line = d3.line()
                .x(function (d) { return x(d.Year) })
                .y(function (d) { return y(d.Rating) })

            svg.append("path")
                .datum(xy)
                .attr("class", "line")
                .attr("d", line)

            div.transition()
                .style("opacity", "1")
                .style(cursor = "none")

        })
        .on('mouseleave', function (d) {

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

function newTable(tclass) {
    var tbl = document.createElement('table')
    tbl.setAttribute("class", tclass)
    tbl.setAttribute("id", tclass)
    var tbdy = document.createElement('tbody')
    return [tbl, tbdy]
}

// adds a row of text.length cells with class newclass to table tbdy
function newRow(tbdy, text, newclass) {
    var row = tbdy.insertRow(-1)
    for (i = 0; i < text.length; i++) {
        var cell = row.insertCell(i)
        createCell(cell, text[i], newclass)
    }
    // document.getElementById('table').rows[-1].cells.length;
    // document.getElementById('activities').className='selectedItem';
    // cell2.attr("class", "player-table")
}

function createCell(cell, text, newclass) {
    var div = document.createElement('div'), // create DIV element
        txt = document.createTextNode(text); // create text node
    div.appendChild(txt);                    // append text node to the DIV
    div.setAttribute('class', newclass);        // set DIV class attribute
    cell.appendChild(div);                   // append DIV to the table cell
}

function sortBy(id) {
    var tbl, i, x, y;
    tbl = document.getElementById("saved");
    var switching = true;

    // Run loop until no switching is needed 
    while (switching) {
        switching = false;
        var rows = tbl.rows;

        // Loop to go through all rows 
        for (i = 1; i < (rows.length - 1); i++) {
            var Switch = false;

            // Fetch 2 elements that need to be compared 
            x = rows[i].getElementsByTagName("TD")[id];
            y = rows[i + 1].getElementsByTagName("TD")[id];

            if (id == 0) {// Check if 2 rows need to be switched 
                if (x.innerText > y.innerText) {
                    // If yes, mark Switch as needed and break loop 
                    Switch = true;
                    break;
                }
            }
            else if (id == 3){
                if (parseInt(x.innerText) > parseInt(y.innerText)) {
                    // If yes, mark Switch as needed and break loop 
                    Switch = true;
                    break;
                }
            }
            else {
                if (x.innerText < y.innerText) {
                    // If yes, mark Switch as needed and break loop 
                    Switch = true;
                    break;
                }
            }
        }
        if (Switch) {
            // Function to switch rows and mark switch as completed 
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
        }
    }

}

