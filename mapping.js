function makemap(){
    d3.json("./data/TM_WORLD_BORDERS-0.3", function(error, uk) {
    if (error) return console.error(error)
    console.log(uk)
})
}
