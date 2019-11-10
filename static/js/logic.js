let trace = {
    x: [1, 2, 3, 4],
    y: [20, 100, 30, 80],
    name: 'blue'
}

let trace2 = {
    x: ['this', 'is', 'a', 'trace'],
    y: [20, 10, 50, 16]
}
let lineTrace2 = {
    x: [1, 2, 3, 4],
    y: [80, 20, 70, 20],
    name: 'Orange'
}

let negBarTrace = {
    x: [1, 2, 3, 4],
    y: [10, 20, -10, -20]
}

// let barGraph = new BarChart('barGraph', trace);
// let multiLineGraph = new MultiLine('multiLineGraph', [trace])
let barGraph = new BarChart('barGraph', negBarTrace);



// barGraph.updateBars(trace2);

d3.select('#update').on('click', () => {
    barGraph.updateBars(trace);
    // multiLineGraph.addTrace(lineTrace2);
});

window.addEventListener('resize', () => {
    // multiLineGraph.render();
    barGraph.render()
});