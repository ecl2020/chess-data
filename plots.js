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
    var height = 400 // $(document).height() * 0.65
    var width = $(document).width() * 0.50
    var padding = 40

    // checks if an svg already exists
    var svg = d3.select("svg > g")
    if (svg.empty()) {
        // if an svg does not exist, a new one is appended to the plot div
        var svg = d3.select(plot).append("svg")
            .attr("class", "oldsvg")
            .attr("width", width)
            .attr("height", height)
    }

    // reloads the page on resize? this should be checked
    d3.select('svg').onresize = function (event) {
        document.location.reload(true)
    }


    // d3.tsv("https://raw.githubusercontent.com/ecl2020/chess-data/master/data/cmr.txt", function(error, data))
    d3.tsv(address, function (error, alldata) {
        if (error) throw error

        // only data with d.Rank <= rank should be plotted
        var data = rankData(alldata, rank, "Rank", 0)

        // updates points and axes -- maybe these could be combined??
        updateAxis(width, height, padding, data, svg)
        updatePointsExplore(height, width, padding, data, rank)
        // creates a button to only show saved players if one does not exist already
        if (!document.getElementById('savebtn')) {
            // create an input element
            var showSaved = document.createElement('input')
            showSaved.type = "button"
            showSaved.id = "savebtn"
            showSaved.value = "Compare Saved Players"
            // only perform actions when clicked
            showSaved.addEventListener('click', function () {
                // gets the rank as the value in the rank option
                rank = document.getElementById("nValue").value
                // retrieves all data at or below that rank
                newdata = rankData(alldata, rank, "Rank", 0)
                // updates points and axes with the saved players only
                savedOnly(newdata, rank, width, height, padding, svg)
            })
            // add the button to the page
            document.body.append(showSaved)
        }
        // creates a show all players button if necessary
        if (!document.getElementById('allbtn')) {
            var showAll = document.createElement('input')
            showAll.id = 'allbtn'
            showAll.type = "button"
            showAll.value = "Show All Players"
            showAll.addEventListener('click', function () {
                updateAxis(width, height, padding, rankData(alldata, rank, "Rank", 0), svg)
                updatePointsExplore(height, width, padding, rankData(alldata, rank, "Rank", 0), rank)
            })
            // add the button to the page
            document.body.append(showAll)
        }
    })
}

function makeTitle(svg, plot_title, x, y, err) {
    // err is true when a player has already been saved
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
    // otherwise another message is displayed. 
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

function savedOnly(data, rank, width, height, padding, svg) {
    var nameList = []
    // get the table containing saved players then isolate cells
    var tbl = document.getElementById('saved')
    var cells = tbl.getElementsByTagName('td')
    // loop through all cells, ignoring the header
    for (var i = 3; i < cells.length; i++) {
        // only the name of the player does not have digits in the text
        if (!hasNumber(cells[i].innerText)) {
            // add name to list of saved names
            nameList.push(cells[i].innerText)
        }
    }
    // select only the data which has a saved name
    var named = data.filter(function (d) {
        return nameList.includes(d.Name)
    })
    // deletes all rows of the saved player table except the header
    var rows = document.getElementById('saved').rows;
    var i = rows.length;
    while (--i) {
        rows[i].parentNode.removeChild(rows[i]);
    }
    // updates the axes with new data
    updateAxis(width, height, padding, named, svg)
    // updates the points with new data
    updatePointsExplore(height, width, padding, named, rank)
}

// saved is false when no players have been saved yet
var saved = false
function updatePointsExplore(height, width, padding, data, rank) {
    // scale the axes according to given data
    var x = d3.scaleLinear()
        .domain([d3.min(data, d => d.Year), d3.max(data, d => d.Year)])
        .range([padding, width - padding]);
    var y = d3.scaleLinear()
        .domain([d3.min(data, d => d.Rating), d3.max(data, d => d.Rating)])
        .range([height - padding, padding])

    // remove all lines (so far these only show up for highlights)
    d3.selectAll("path.line").remove()
    // remove all highlighted points
    d3.selectAll($("[class=new]")).remove()
    // select the svg and all non-highlighted circles
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

    // remove all circles not being used
    u
        .exit()
        .transition() // and apply changes to all of them
        .style("opacity", 0)
        .remove()

    // height for placing the title. Should be defined in terms of svg height?
    var height = 400
    var width = 200 // $(document).width() * 0.50

    // set up mouseover for any circle on the plot
    svg.selectAll('circle')
        .on('mouseenter', function (d) {
            var current = d.Name
            highlight(x, y, data, svg, width, height, current, rank, padding)
        })
        .on('mouseleave', function (d) {

        })
}

function highlight(x, y, data, svg, width, height, current, rank, padding) {
    // get data so each name has a list of points associated
    var dataByName = d3.nest()
        .key(function (d) { return d.Name; })
        .entries(data);

    // remove the current plot title ()
    d3.selectAll($("[class=plot_title]")).remove()
    // remove all the highlight points 
    d3.selectAll($("[class=new]")).remove()
    // remove highlight line (well actually just all lines for now)
    d3.selectAll("path.line").remove()
    // remove side table with detailed player info
    d3.selectAll($("[class=player-table]")).remove()
    // reset the title
    makeTitle(svg, "click a green point to save " + current, width / 3, height - height * 0.02, false)

    // return the points associated with current name
    var named = dataByName.filter(function (d) {
        return d.key == current;
    })
    // isolate the ratings associated with current name
    var ratings = d3.values(named).map(function (d) {
        return d.values.map(function (d) { return d.Rating; });
    })[0];
    // isolate years
    var years = d3.values(named).map(function (d) {
        return d.values.map(function (d) { return d.Year; });
    })[0];
    // isolate ranks for each rating/year
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

    // create new circles with the selected data
    const circle = svg.selectAll("circle.new")
        .data(xy);

    // create the new table
    var tbl = newTable('player-table')[0]
    var tbdy = newTable('player-table')[1]
    // header row of the new table with just the player name 
    newRow(tbdy, [current, ""], 'player-cell')

    // if there is more than one year in top rank show start and end
    if (d3.max(xy, d => d.Year) != d3.min(xy, d => d.Year)) {
        newRow(tbdy, ["years in top " + rank,
        xy.length + " (" + d3.min(xy, d => d.Year) + " - " + d3.max(xy, d => d.Year) + ")"], 'player-cell')
    }
    // if there is only one year in top rank only show one year
    else {
        newRow(tbdy, ["years in top " + rank, xy.length + " (" + d3.max(xy, d => d.Year) + ")"], 'player-cell')
    }
    newRow(tbdy, ["average rating", Math.round(d3.mean(xy, d => d.Rating))], 'player-cell')
    newRow(tbdy, ["highest rating", d3.max(xy, d => d.Rating)], 'player-cell')
    newRow(tbdy, ["top rank", d3.min(xy, d => d.Rank)], 'player-cell')

    // more rows if the highlighted player was ever highest rated
    if (d3.min(xy, d => d.Rank) == 1) {
        newRow(tbdy, ["years at #1", xy.filter(function (d) {
            return d.Rank == 1;
        }).length], 'player-cell')
    }

    // add the table to page so it actually shows up
    tbl.appendChild(tbdy);
    document.body.append(tbl)

    // add highlighted circles to the plot
    circle.enter().append("circle")
        .attr('cx', function (d) { return x(d.Year) })
        .attr('cy', function (d) { return y(d.Rating) })
        .attr("r", 3)
        .attr("class", "new")
        .style('fill', "#33e5b5")
        // save a player to the player table
        .on('click', function () {
            savePlayer(current, xy, svg, height, width, padding, data)
        })

    // make a line to highlight the data
    var line = d3.line()
        .x(function (d) { return x(d.Year) })
        .y(function (d) { return y(d.Rating) })

    // add the line to the svg
    svg.append("path")
        .datum(xy)
        .attr("class", "line")
        .attr("d", line)
}

// saves player current with data xy and makes a new title on the svg
function savePlayer(current, xy, svg, height, width, padding, data) {
    // scale the axes according to given data
    var x = d3.scaleLinear()
        .domain([d3.min(data, d => d.Year), d3.max(data, d => d.Year)])
        .range([padding, width - padding]);
    var y = d3.scaleLinear()
        .domain([d3.min(data, d => d.Rating), d3.max(data, d => d.Rating)])
        .range([height - padding, padding])
    // get the current rank for use in displaying saved player
    rank = document.getElementById("nValue").value

    // assumes the player is not in the table
    var contained = false
    // find the saved player table
    var tbl = document.getElementById('saved')
    // return the cells to search through
    var cells = tbl.getElementsByClassName('saved-player')
    // saved is true when players have already been saved
    if (saved) {
        // loop through all cells
        for (var i = 0; i < cells.length; i++) {
            // check if the saved name matches an existing row
            if (cells[i].innerText == current) {
                contained = true
            }
        }
    }
    if (!contained) {
        // return the body of the table 
        var tbdy = document.getElementById('saved').tBodies[0]
        // set up the text to make a new row: Name, Stats
        var text = [
            current,
            parseInt(Math.round(d3.mean(xy, d => d.Rating))),
            parseInt(d3.max(xy, d => d.Rating)),
            parseInt(d3.min(xy, d => d.Rank))]
        // build a new row with that text --> cells will have class 'saved-player'
        newRow(tbdy, text, 'saved-player')
        // loop through last row of cells (the ones just made)
        for (var i = cells.length - 4; i < cells.length; i++) {
            cells[i].onclick = function () {
                console.log("highlight")
                // run the highlight function on click
                highlight(x, y, data, svg, width, height, current, rank)
                window.scrollTo(0,0)
            }
        }
        // update the plot title
        d3.selectAll($("[class=plot_title]")).remove()
        makeTitle(svg, "saved " + current, width / 3, height - height * 0.02, false)
        saved = true
    }
    // if the player is already in the table
    else {
        // update the title
        d3.selectAll($("[class=plot_title]")).remove()
        makeTitle(svg, current + " already saved.", width / 3, height - height * 0.02, true)
    }
}

// adds links to other pages
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

// returns [0] a new table with class tclass
//         [1] a new body with class tclass
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
        txt = document.createTextNode(text)  // create text node
    div.appendChild(txt)                     // append text node to the DIV
    div.setAttribute('class', newclass)      // set DIV class attribute
    cell.appendChild(div)                    // append DIV to the table cell
}

// for sorting saved player tables
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
            else if (id == 3) {
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

