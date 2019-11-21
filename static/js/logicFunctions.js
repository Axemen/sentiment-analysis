let titleTracesScatter = [];
let descTracesScatter = [];

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

        titleTracesScatter.push(titleTrace);
        descTracesScatter.push(descTrace);

        // titleScatter.addTrace(titleTrace);
        // descScatter.addTrace(descTrace);
    })
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
        x: titleCounts.map(d => d.word).slice(0, 10),
        y: titleCounts.map(d => d.count).slice(0, 10)
    }
    let descTrace = {
        x: descCounts.map(d => d.word).slice(0, 10),
        y: descCounts.map(d => d.count).slice(0, 10)
    }

    titleCountBar.updateBars(titleTrace);
    descCountBar.updateBars(descTrace);


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
    if (btnClasses.includes('btn-danger')) {
        btn.attr('class', 'btn btn-success')
        updateScattersBySource(name);
        sources.push(name);
        updateBarsBySources(sources);
    } else {
        btn.attr('class', 'btn btn-danger')
        sources.splice(sources.indexOf(name), 1);
        titleScatter.removeTrace(name);
        descScatter.removeTrace(name);

        updateBarsBySources(sources);
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