
let parseTime = d3.timeParse('%Y-%m-%dT%H:%M:%SZ');
let formatTime = d3.timeFormat('%H:%M');

let trace = {
    x: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    y: [0, 1, 2, 3, 4, -1, -2, -3, -4, -3],
    name: 'trace1'
}

let trace2 = {
    x: [0, 1, 2],
    y: [-1, -2, -3],
    name: 'trace2'
}

// let scatter = new scatterPlot('BarChart', [trace]);

d3.select('#update').on('click', () => {
    // updateScatterBySource('nbc-news');
    scatter.removeTrace('cnn-scatter');
})

getRecords('cnn').then(data => {

    data.forEach(d => d.publishedAt = parseTime(d.publishedAt));
    data.sort((a, b) => a.publishedAt - b.publishedAt);
    data.forEach(d => formatTime(d.publishedAt));

    let trace = {
        x: data.map(d => d.publishedAt),
        y: data.map(d => d.title_compound),
        name: 'cnn'
    }

    scatter = new scatterPlot('scatterPlot', [trace])

});

function updateScatterBySource(source) {
    getRecords(source).then(data => {
        data.forEach(d => d.publishedAt = parseTime(d.publishedAt));
        data.sort((a, b) => a.publishedAt - b.publishedAt);

        let trace = {
            x: data.map(d => d.publishedAt),
            y: data.map(d => d.title_compound),
            name: source
        }
        scatter.addTrace(trace);
    })
}


d3.select('#scatter-checkboxes')
    .selectAll('input')
    .on('click', handleCheckBox)

function handleCheckBox() {
    console.log(d3.event.target.name);
    if(d3.event.target.checked){
        updateScatterBySource(d3.event.target.name);
    }else{
        scatter.removeTrace(d3.event.target.name);
    }
}

window.addEventListener('resize', () => {
    scatter.render();
})