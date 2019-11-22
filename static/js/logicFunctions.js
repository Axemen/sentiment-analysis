function updateScattersBySource(source) {
    getRecordsBySource(source).then(data => {
        data.forEach(d => d.publishedAt = parseTime(d.publishedAt));
        data.sort((a, b) => a.publishedAt - b.publishedAt);

        let titleTrace = {
            x: data.map(d => d.publishedAt),
            y: data.map(d => d.title_compound),
            name: source,
            color: colorBySource(source)
        }

        let descTrace = {
            x: data.map(d => d.publishedAt),
            y: data.map(d => d.description_compound),
            name: source,
            color: colorBySource(source)
        }

        if (titleOrDesc) {
            titleScatter.addTrace(titleTrace);
        } else {
            titleScatter.addTrace(descTrace);
        }

        titleTracesScatter.push(titleTrace);
        descTracesScatter.push(descTrace);
    })
}

function titleDescSwitcher() {
    titleScatter.updateAllTraces(descTracesScatter);
}

function updateBarsBySources(sources) {

    let data = filterCountDataBySources(sources);

    let titleCounts = Object.entries(data.title).map(d => {
        return { word: d[0], count: d[1] };
    }).sort((a, b) => b.count - a.count)
        .filter(d => !badWords.includes(d.word));

    let descCounts = Object.entries(data.desc).map(d => {
        return { word: d[0], count: d[1] };
    }).sort((a, b) => b.count - a.count)
        .filter(d => !badWords.includes(d.word));

    let titleTrace = {
        x: titleCounts.map(d => d.word).slice(0, 20),
        y: titleCounts.map(d => d.count).slice(0, 20)
    }
    let descTrace = {
        x: descCounts.map(d => d.word).slice(0, 20),
        y: descCounts.map(d => d.count).slice(0, 20)
    }

    countBarDescTrace = descTrace;
    countBarTitleTrace = titleTrace;

    if (countTitleOrDesc) {
        titleCountBar.updateBars(titleTrace);
    } else {
        titleCountBar.updateBars(descTrace);
    }

    getPeopleBySources(sources).then(data => {
        let mutatedData = Object.entries(data).map(d => [d[0], d[1]])
        mutatedData.sort((a, b) => b[1] - a[1])

        let trace = {
            x: mutatedData.map(d => d[0]).slice(0, 10),
            y: mutatedData.map(d => d[1]).slice(0, 10)
        }

        peopleCountBar.updateBars(trace);
    })



}

function colorBySource(source) {
    let color = 'black';
    // ['#235789', '#ED1C24', '#F1D302', '#EC058E', '#00ff1e']
    switch (source) {
        case 'cnn':
            color = '#00e1ff';
            return color;
        case 'nbc-news':
            color = '#ED1C24';
            return color;
        case 'bbc-news':
            color = '#F1D302';
            return color;
        case 'fox-news':
            color = '#EC058E';
            return color;
        case 'associated-press':
            color = '#00ff1e';
            return color;
        default:
            break;
    }
}

function handleCheckBox() {
    // Gets the info for the current event target
    let btn = d3.select(d3.event.target)
    let btnClasses = btn.attr('class').split(' ')
    let name = btn.attr('name')

    let titleNames = titleTracesScatter.map(d => d.name);
    let descNamees = descTracesScatter.map(d => d.name);

    if (btnClasses.includes('btn-danger')) {

        updateScattersBySource(name);
        sources.push(name);
        updateBarsBySources(sources);
        btn.attr('class', 'btn btn-success')
    } else {

        sources.splice(sources.indexOf(name), 1);
        titleTracesScatter.splice(titleNames.indexOf(name), 1);
        descTracesScatter.splice(descNamees.indexOf(name), 1);

        titleScatter.removeTrace(name);
        updateBarsBySources(sources);

        btn.attr('class', 'btn btn-danger')
    }

    // if (btnClasses.includes('btn-primary')) {
    //     btn.attr('class', 'btn btn-warning')
    // } else {
    //     btn.attr('class', 'btn btn-primary')
    // }
}

function filterWords(data) {

    return data.filter(d => {
        if (!badWords.includes(d.word)) {
            return 0
        }
        return 1
    })
}

function filterCountDataBySources(sources) {
    let combined = {
        title: {},
        desc: {}
    }

    sources.forEach(source => {
        Object.keys(countData[source].title)
            .forEach(word => {
                if (word in combined.title) {
                    combined.title[word] += countData[source]['title'][word]
                } else {
                    combined.title[word] = countData[source]['title'][word]
                }
            })

        Object.keys(countData[source].desc)
            .forEach(word => {
                if (word in combined.desc) {
                    combined.desc[word] += countData[source]['desc'][word]
                } else {
                    combined.desc[word] = countData[source]['desc'][word]
                }
            })
    })

    return combined;
}