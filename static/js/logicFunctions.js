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

        titleScatter.addTrace(titleTrace);
        descScatter.addTrace(descTrace);
    })
}

function updateBarsBySources(sources) {
    getCountsSources(sources).then(data => {
        let titleCounts = Object.entries(data.title_counts).map(d => {
            return { word: d[0], count: d[1] };
        }).sort((a, b) => b.count - a.count)
            .filter(d => !badWords.includes(d.word));

        let descCounts = Object.entries(data.description_counts).map(d => {
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
        
    })
}

function colorBySource(source) {
    let color = 'black';
    switch (source) {
        case 'cnn':
            color = 'steelblue';
            return color;
        case 'nbc-news':
            color = '#955196';
            return color;
        case 'bbc-news':
            color = '#dd5182';
            return color;
        case 'fox-news':
            color = '#ff6e54';
            return color;
        case 'associated-press':
            color = '#ffa600';
            return color;
        default:
            break;
    }
}

function handleCheckBox() {
    name = d3.event.target.name
    if (d3.event.target.checked) {
        updateScattersBySource(name);
        sources.push(name);
        updateBarsBySources(sources);
    } else {
        titleScatter.removeTrace(name);
        descScatter.removeTrace(name);
        sources.splice(sources.indexOf(name), 1);
        updateBarsBySources(sources);
    }
}

function filterWords(data) {

    return data.filter(d => {
        if (!badWords.includes(d.word)) {
            return 0
        }
        return 1
    })
}