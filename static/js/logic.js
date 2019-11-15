
let parseTime = d3.timeParse('%Y-%m-%dT%H:%M:%SZ');
let formatTime = d3.timeFormat('%H:%M');
let badWords = [' ', '...', "…", '’s', '—']

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

    let sources = ['cnn', 'nbc-news', 'bbc-news', 'fox-news', 'associated-press'];
    let titleTrace = [];
    let descTrace = [];
    sources.forEach(source => {
        let filteredData = data.filter(d => d.source === source)
        let titleCounts = {
            source: source,
            pos: 0,
            neg: 0
        };
        let descCounts = {
            source: source,
            pos: 0,
            neg: 0
        };
        filteredData.forEach(d => {
            if (d.title_compound > 0) {
                titleCounts.pos += 1;
            }else if (d.title_compound < 0) {
                titleCounts.neg += 1;
            }
            if (d.description_compound > 0) {
                descCounts.pos += 1;
            }else if (d.description_compound < 0) {
                descCounts.neg += 1;
            }

        })
        titleTrace.push(titleCounts);
        descTrace.push(descCounts);
    })

    titleBar = new MultiBar('posBarChart', titleTrace);
    descBar = new MultiBar('negBarChart', descTrace)
})

getCounts('cnn').then(data => {
    // console.log(data);

    let titleCounts = Object.entries(data.title_counts).map(d => {
        return {word: d[0], count: d[1]};
    })
        .sort((a, b) => b.count-a.count)
        .filter(d => !badWords.includes(d.word));
    let descCounts = Object.entries(data.description_counts).map(d => {
        return {word: d[0], count: d[1]};
    })
        .sort((a, b) => b.count-a.count)
        .filter(d => !badWords.includes(d.word));



    let titleTrace = {
        x: titleCounts.map(d => d.word).slice(0, 10),
        y: titleCounts.map(d => d.count).slice(0, 10)
    }
    let descTrace = {
        x: descCounts.map(d => d.word).slice(0, 10),
        y: descCounts.map(d => d.count).slice(0, 10)
    }


    titleCountBar = new BarChart('titleWordCountBar', titleTrace);
    descCountBar = new BarChart('descWordCountBar', descTrace);

    // console.log(descCounts);
})

sources = ['cnn']

d3.select('#scatter-checkboxes')
    .selectAll('input')
    .on('click', handleCheckBox);



window.addEventListener('resize', () => {
    titleScatter.render();
    descScatter.render();
    titleBar.render();
    descBar.render();
    titleCountBar.render();
    descCountBar.render();
})

