
let parseTime = d3.timeParse('%Y-%m-%dT%H:%M:%SZ'),
    formatTime = d3.timeFormat('%H:%M'),
    badWords = [' ', '...', "…", '’s', '—'],
    countData = {},
    titleTracesScatter = [],
    descTracesScatter = [],
    multibarTitleTrace = [],
    multibarDescTrace = [],
    countBarTitleTrace = [],
    countBarDescTrace = [],
    countTitleOrDesc = true,
    titleOrDesc = true;

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

    titleTracesScatter.push(titleTrace);
    descTracesScatter.push(descTrace);

    titleScatter = new scatterPlot('scatterPlot', [titleTrace]);
    // descScatter = new scatterPlot('scatterPlotDesc', [descTrace])
});

getRecords().then(data => {

    let sources = ['cnn', 'nbc-news', 'bbc-news', 'fox-news', 'associated-press'];

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
            } else if (d.title_compound < 0) {
                titleCounts.neg += 1;
            }
            if (d.description_compound > 0) {
                descCounts.pos += 1;
            } else if (d.description_compound < 0) {
                descCounts.neg += 1;
            }

        })


        multibarTitleTrace.push(titleCounts);
        multibarDescTrace.push(descCounts);
    })

    titleBar = new MultiBar('posBarChart', multibarTitleTrace);
})



getAllCounts().then(data => {
    countData = data;

    data = filterCountDataBySources(['cnn'])


    let titleCounts = Object.entries(data.title).map(d => {
        return { word: d[0], count: d[1] };
    })
        .sort((a, b) => b.count - a.count)
        .filter(d => !badWords.includes(d.word));
    let descCounts = Object.entries(data.desc).map(d => {
        return { word: d[0], count: d[1] };
    })
        .sort((a, b) => b.count - a.count)
        .filter(d => !badWords.includes(d.word));



    let titleTrace = {
        x: titleCounts.map(d => d.word).slice(0, 20),
        y: titleCounts.map(d => d.count).slice(0, 20)
    }
    let descTrace = {
        x: descCounts.map(d => d.word).slice(0, 20),
        y: descCounts.map(d => d.count).slice(0, 20)
    }
    margin = {
        top: 40,
        bottom: 100,
        left: 20,
        right: 20
    }

    countBarDescTrace = descTrace;
    countBarTitleTrace = titleTrace;

    titleCountBar = new BarChart('titleWordCountBar', titleTrace, margin);
})

getPeopleBySources(['cnn']).then(data => {

    let mutatedData = Object.entries(data).map(d => [d[0], d[1]])
    mutatedData.sort((a, b) => b[1]-a[1])
    
    let trace = {
        x: mutatedData.map(d => d[0]).slice(0, 10),
        y: mutatedData.map(d => d[1]).slice(0, 10)
    }
    margin = {
        top: 40,
        bottom: 100,
        left: 20,
        right: 20
    }

    peopleCountBar = new BarChart('peopleCount', trace, margin);
})

sources = ['cnn']

d3.select('#scatter-checkboxes')
    .selectAll('button')
    .on('click', handleCheckBox);

d3.select('#test').on('click', () => {
    console.log('testing')
    titleBar.updateData(multibarDescTrace);
})

window.addEventListener('resize', () => {
    titleScatter.render();
    // descScatter.render();
    titleBar.render();
    // descBar.render();
    titleCountBar.render();
    // descCountBar.render();
})

d3.select('#scatterTitle').on('click', () => {
    titleOrDesc = true;
    titleScatter.updateAllTraces(titleTracesScatter);
    d3.select('#scatterDesc').classed('active', false);
    d3.select(d3.event.target).classed('active', true)
})

d3.select('#scatterDesc').on('click', () => {
    titleOrDesc = false;
    titleScatter.updateAllTraces(descTracesScatter);
    d3.select('#scatterTitle').classed('active', false);
    d3.select(d3.event.target).classed('active', true)
})

d3.select('#multibarTitle').on('click', () => {
    titleBar.updateData(multibarTitleTrace);
    d3.select('#multibarTitle').classed('active', true);
    d3.select('#multibarDesc').classed('active', false);
})

d3.select('#multibarDesc').on('click', () => {
    titleBar.updateData(multibarDescTrace);
    d3.select('#multibarTitle').classed('active', false);
    d3.select('#multibarDesc').classed('active', true);
})

d3.select('#countBarTitle').on('click', () => {
    countTitleOrDesc = true;
    titleCountBar.updateBars(countBarTitleTrace);
    d3.select('#countBarTitle').classed('active', true);
    d3.select('#countBarDesc').classed('active', false);
})

d3.select('#countBarDesc').on('click', () => {
    countTitleOrDesc = false;
    titleCountBar.updateBars(countBarDescTrace);
    d3.select('#countBarTitle').classed('active', false);
    d3.select('#countBarDesc').classed('active', true);
})