function bounds(max) {
    return [max * 0.05, max - (max * 0.05)]
}

function plot(address, plot, rank=50) {
    var height = $(document).height() * 0.65
    var width = $(document).width() * 0.80
    var padding = 40

    // var svg = d3.select(#cmr_plot)
    var svg = d3.select(plot).append("svg")
        .attr("width", width)
        .attr("height", height)

    // d3.tsv("https://raw.githubusercontent.com/ecl2020/chess-data/master/data/cmr.txt", function(error, data))
    d3.tsv(address, function (error, data) {
        if (error) throw error;
        // var data = data.filter(function (d) {
        //     return d.Rating >= 2600;
        // })
        var dataByName = d3.nest()
            .key(function (d) { return d.Name; })
            .entries(data);
        // console.log(dataByName)

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
        svg.append("g")
            .attr("transform", "translate(0," + (height - padding) + ")")
            .call(x_axis);

        // Add the y Axis
        var y_axis = d3.axisLeft()
            .scale(y)
        svg.append("g")
            .attr("transform", "translate(" + padding + ",0)")
            .call(y_axis);

        var div = d3.select(plot).append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("pointerEvents", "none")

        svg.selectAll('circle.all').data(data)
            .enter().append('circle')
            .attr("class", "all")
            .attr('cx', function (d) { return x(d.Year) })
            .attr('cy', function (d) { return y(d.Rating) })
            .attr('r', 1.5)
            .style('fill', "#33b5e5")
            .on('mouseenter', function (w) {
                d3.selectAll($("[class=plot_title]")).remove()
                d3.selectAll($("[class=new]")).remove()
                d3.selectAll("path.line").remove()
                var current = w.Name
                makeTitle(current, width / 3, height - height * 0.02)

                var named = dataByName.filter(function (d) {
                    return d.key == current;
                })

                var ratings = d3.values(named).map(function (d) {
                    return d.values.map(function (v) { return v.Rating; });
                })[0];
                var years = d3.values(named).map(function (d) {
                    return d.values.map(function (v) { return v.Year; });
                })[0];
                var xy = []; // start empty, add each element one at a time
                for (var i = 0; i < years.length; i++) {
                    xy.push({ Year: parseInt(years[i]), Rating: parseInt(ratings[i]) }) //, Name: current });
                }
                const circle = svg.selectAll("circle.new")
                    .data(xy);
                circle.enter().append("circle")
                    .attr('cx', function (d) { return x(d.Year) })
                    .attr('cy', function (d) { return y(d.Rating) })
                    .attr("r", 3)
                    .attr("class", "new")
                    .style('fill', "#33e5b5")
                    .on('click', function (w, i) {
                        d3.selectAll($("[class=player-table]")).remove()
                        player(current, xy)
                        // d3.selectAll($("[class=all]"))
                        //     .style("opacity", "0")
                        // console.log("get clicked")
                        if (window.pageYOffset == 0){
                            window.scrollBy(0, 90)
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

            });

        //title of the plot
        function makeTitle(plot_title, x, y) {
            svg.append("text")
                .attr("class", "plot_title")
                .attr("x", x)
                .attr("y", y)
                .attr("text-anchor", "start")
                .style("font-size", "12px")
                .style("font-family", "Courier")
                .text("now showing: " + plot_title)
        }
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

function player(pname, xy) {
    // var name = document.createElement("p")
    // var node = document.createTextNode(pname)
    // name.appendChild(node);
    // console.log(xy)
    // document.body.append(name)

    var tbl = document.createElement('table')
    tbl.setAttribute("class", "player-table")
    var tbdy = document.createElement('tbody')

    // TODO - get newRow function working for arbitrary number of cells
    newRow(tbdy, [pname, ""], 'player-table')
    // var x = document.getElementsByClassName('player-table')
    // x[0].setAttribute('id', 'pname');
    // console.log(x)
    if (d3.max(xy, d => d.Year) != d3.min(xy, d => d.Year)) {
        newRow(tbdy, ["years in top 100",
        xy.length + " (" + d3.min(xy, d => d.Year) + " - " + d3.max(xy, d => d.Year) + ")"], 'player-table')
    }
    else{
        newRow(tbdy, ["years in top 100", xy.length + " (" + d3.max(xy, d => d.Year) + ")"], 'player-table')

    }
    newRow(tbdy, ["average rating", Math.round(d3.mean(xy, d => d.Rating))], 'player-table')
    newRow(tbdy, ["highest rating", d3.max(xy, d => d.Rating)], 'player-table')

    tbl.appendChild(tbdy);
    document.body.append(tbl)
}

function newRow(tbdy, text, newclass) {
    var row = tbdy.insertRow(-1)
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    createCell(cell1, text[0], newclass)
    createCell(cell2, text[1], newclass)
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

