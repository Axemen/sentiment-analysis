
d3.json('/get-records').then(data => {
    filteredData = data.filter(d => d.title_compound !== 0)
    let trace = {
        x: filteredData.map(d => d.title_compound),
        numBins: 10
    }
    hist = new Histogram('test', trace);
    hist.xAxis.tickFormat(d3.format(".1f"));
    hist.render();
})





d3.select('#button').on('click', () => {
    let test = {
        x: genData(),
        numBins: 20
    }
    // console.log()
    hist.updateBars(test);
})

function genData() {
    let data = []
    for (let i = 0; i < 100; i++) {
        data.push(Math.random() * 100)
    }
    return data;
}