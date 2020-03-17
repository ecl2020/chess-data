var height = 400 // $(document).height() * 0.65
var width = window.innerWidth * 0.5
var padding = 40

var checked = false
function updateAxis(data, svg) {
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
// compare: 0 (less than/equal to (#)), 1 (greater than/equal to(#)), or 2 (equal to (# or str))
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
    // the rank (and the number of different players displayed) has changed
    rankchange = true
    // checks if an svg already exists
    var svg = d3.select("svg > g")
    if (svg.empty()) {
        // if an svg does not exist, a new one is appended to the plot div
        var svg = d3.select(plot).append("svg")
            .attr("class", "oldsvg")
            .attr("id", "svgID")
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
        updateAxis(data, svg)
        updatePointsExplore(data, rank)
        // creates a button to only show saved players if one does not exist already
        if (!document.getElementById('savebtn')) {
            // create an input element
            var showSaved = document.createElement('input')
            showSaved.type = "button"
            showSaved.id = "savebtn"
            showSaved.className = "show"
            showSaved.value = "Compare Saved Players"
            // only perform actions when clicked
            showSaved.addEventListener('click', function () {
                // gets the rank as the value in the rank option
                rank = document.getElementById("nValue").value
                // retrieves all data at or below that rank
                newdata = rankData(alldata, rank, "Rank", 0)
                // updates points and axes with the saved players only
                savedOnly(newdata, rank, svg)
            })
            // add the button to the page
            document.getElementById("user-input").appendChild(showSaved)
        }
        // creates a show all players button if necessary
        if (!document.getElementById('allbtn')) {
            var showAll = document.createElement('input')
            showAll.id = 'allbtn'
            showAll.type = "button"
            showAll.className = "show"
            showAll.value = "Show All Players"
            showAll.addEventListener('click', function () {
                updateAxis(rankData(alldata, rank, "Rank", 0), svg)
                updatePointsExplore(rankData(alldata, rank, "Rank", 0), rank)
            })
            // add the button to the page
            document.getElementById("user-input").appendChild(showAll)
        }
    })
}

function makeTitle(plot_title, x, y, err) {
    // err is true when a player has already been saved
    // get the svg to make the title on
    var svg = d3.select("svg")
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

function savedOnly(data, rank, svg) {
    // set search to empty
    document.getElementById('searchName').value = ""
    // get list of all searchable players
    var listel = document.getElementsByClassName('search-player')
    if (listel) {
        // hide them all
        for (var i = 0; i < listel.length; i++) {
            listel[i].style.display = "none"
        }
    }
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
    updateAxis(named, svg)
    // updates the points with new data
    updatePointsExplore(named, rank)
}

// saved is false when no players have been saved yet
var saved = false
function updatePointsExplore(data, rank) {
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

    // set up mouseover for any circle on the plot
    svg.selectAll('circle')
        .on('mouseenter', function (d) {
            // get the name of the circle being moused over
            var current = d.Name
            // highlight all points with that name
            highlight(data, current, rank)
        })
        .on('mouseleave', function (d) {

        })
}

function removeHighlight() {
    // remove the current plot title ()
    d3.selectAll($("[class=plot_title]")).remove()
    // remove all the highlight points 
    d3.selectAll($("[class=new]")).remove()
    // remove highlight line (well actually just all lines for now)
    d3.selectAll("path.line").remove()
    // remove side table with detailed player info
    d3.selectAll($("[class=player-table]")).remove()
}

function getPlayerData(data, player) {
    // get data so each name has a list of points associated
    var dataByName = d3.nest()
        .key(function (d) { return d.Name; })
        .entries(data);
    // return the points associated with current name
    var named = dataByName.filter(function (d) {
        return d.key == player;
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
    return xy
}

function highlight(data, current, rank) {
    var x = d3.scaleLinear()
        .domain([d3.min(data, d => d.Year), d3.max(data, d => d.Year)])
        .range([padding, width - padding]);
    var y = d3.scaleLinear()
        .domain([d3.min(data, d => d.Rating), d3.max(data, d => d.Rating)])
        .range([height - padding, padding])

    removeHighlight()

    // reset the title
    makeTitle("click a green point to save " + current, 20, height - height * 0.02, false)

    // get an array of only data for the current player
    var xy = getPlayerData(data, current)

    // select the svg
    var svg = d3.select("svg")
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
    document.getElementById("plot").append(tbl)

    // add highlighted circles to the plot
    circle.enter().append("circle")
        .attr('cx', function (d) { return x(d.Year) })
        .attr('cy', function (d) { return y(d.Rating) })
        .attr("r", 3)
        .attr("class", "new")
        .style('fill', "#33e5b5")
        // save a player to the player table
        .on('click', function () {
            savePlayer(current, xy, data)
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
function savePlayer(current, xy, data) {
    // get the current rank for use in displaying saved player
    rank = document.getElementById("nValue").value

    // assumes the player is not in the table
    var contained = false
    // find the saved player table
    var tbl = document.getElementById('saved')
    // return the cells to search through
    var cells = tbl.getElementsByClassName('saved-player')
    // saved is true when a non-zero number of players has been saved
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
            parseInt(Math.round(d3.mean(xy, d => d.Rating))) + "\n(in top " + rank + ")",
            parseInt(d3.max(xy, d => d.Rating)),
            parseInt(d3.min(xy, d => d.Rank))]
        // build a new row with that text --> cells will have class 'saved-player'
        newRow(tbdy, text, 'saved-player')
        // loop through last row of cells (the ones just made)
        for (var i = cells.length - 4; i < cells.length; i++) {
            // set up to highlight the clicked player...
            cells[i].onclick = function () {
                highlight(data, current, rank)
                // timeout so the page does not scroll before a double click 
                setTimeout(() => {
                    // show the graph again
                    window.scrollTo({
                        top: 0,
                        // do it slowly instead of jumping
                        behavior: 'smooth'
                    })
                }, 300);
            }
            // and delete the double-clicked player.
            cells[i].ondblclick = function () {
                // loop through rows and delete the matching row
                for (var k = 1; k < tbl.rows.length; k++) {
                    if (tbl.rows[k].cells[0].innerText == current) {
                        tbl.rows[k].remove()
                    }
                }
                // get rid of the highlighted line, which appears again 
                // on the first click of the double click
                removeHighlight()
            }
        }
        // update the plot title
        d3.selectAll($("[class=plot_title]")).remove()
        makeTitle("saved " + current, 20, height - height * 0.02, false)
        saved = true
    }
    // if the player is already in the table
    else {
        // update the title
        d3.selectAll($("[class=plot_title]")).remove()
        makeTitle(current + " already saved.", 20, height - height * 0.02, true)
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

// false when the user has not changed the rank
var rankchange = false
function searchPlayer(address) {
    // identify the list of players to search from
    var searchList = document.getElementById('searchUL')
    var rank = document.getElementById("nValue").value
    // the address for getting data
    d3.tsv(address, function (error, alldata) {
        if (error) throw error

        // get all data showing on the plot (rank <= the value in the nValue input box)
        var data = rankData(alldata, rank, "Rank", 0)
        // sort the data by name for easy referencing (maybe this isn't even necessary?? data[0] is name)  
        var dataByName = d3.nest()
            .key(function (d) { return d.Name; })
            .entries(data);
        // whenever plot() is called --> first plot or rank change
        if (rankchange) {
            // if a list has already been made, delete all of those names
            if (document.getElementsByClassName('li')) {
                d3.selectAll('li').remove()
            }
            // loop through the nested data
            for (var i = 0; i < dataByName.length; i++) {
                // create a new list element
                var li = document.createElement('li')
                // give the new element text equal to the player name
                li.innerText = dataByName[i].key
                li.id = dataByName[i].key
                // don't display it yet though
                li.style.display = "none"
                // give each element a class if it is on the graph or not
                li.className = "search-player"

                // add the element to the list
                searchList.appendChild(li)
            }
            // if the name is on the graph currently add mouse actions
            for (var i = 0; i < dataByName.length; i++) {
                // highlight a player on hover
                document.getElementById(dataByName[i].key)
                    .addEventListener('mouseenter', function (e) {
                        highlight(data, e.target.innerText, rank)
                    })
                // save a player on click
                document.getElementById(dataByName[i].key)
                    .addEventListener('click', function (e) {
                        savePlayer(e.target.innerText, getPlayerData(data, e.target.innerText), data)
                    })
            }
            // since the rank has not been updated since the last list creation
            rankchange = false
        }
        // get the text from the search box
        var searchString = document.getElementById('searchName').value.toUpperCase()
        // get all the elements from the list of players on the plot
        var li = searchList.getElementsByTagName('li')
        // loop through all elements of the list
        for (var i = 0; i < li.length; i++) {
            // only show matching names, do not match empty string
            if (li[i].innerText.toUpperCase().includes(searchString) && searchString) {
                li[i].style.display = ""
            }
            else {
                li[i].style.display = "none"
            }
        }

    })
}

