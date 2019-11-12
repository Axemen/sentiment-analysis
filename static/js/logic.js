
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

getRecordsBySource('cnn').then(data => {

    data.forEach(d => d.publishedAt = parseTime(d.publishedAt));
    data.sort((a, b) => a.publishedAt - b.publishedAt);
    data.forEach(d => formatTime(d.publishedAt));

    let titleTrace = {
        x: data.map(d => d.publishedAt),
        y: data.map(d => d.title_compound),
        name: 'cnn',
        color: colorBySource('cnn')
    }
    let descTrace = {
        x: data.map(d => d.publishedAt),
        y: data.map(d => d.description_compound),
        name: 'cnn',
        color: colorBySource('cnn')
    }

    titleScatter = new scatterPlot('scatterPlot', [titleTrace]);
    descScatter = new scatterPlot('scatterPlotDesc', [descTrace])
});

getRecords().then(data => {

    cnnRecords = data.filter(d => d.source === 'cnn');
    nbcRecords =data.filter(d => d.source === 'nbc-news');
    bbcRecords = data.filter(d => d.source === 'bbc-news');
    foxRecords = data.filter(d => d.source === 'fox-news');
    apRecords = data.filter(d => d.source === 'associated-press');

    let barTrace = {
        x: ['CNN', 'NBC', 'BBC', 'FOX', 'AP'],
        y: [
            d3.mean(cnnRecords, d => d.description_compound),
            d3.mean(nbcRecords, d => d.description_compound),
            d3.mean(bbcRecords, d => d.description_compound),
            d3.mean(foxRecords, d => d.description_compound),
            d3.mean(apRecords, d => d.description_compound)
        ]
    }

    bar = new BarChart('barChart', barTrace);
    
})




d3.select('#scatter-checkboxes')
    .selectAll('input')
    .on('click', handleCheckBox)



window.addEventListener('resize', () => {
    titleScatter.render();
    descScatter.render();
})