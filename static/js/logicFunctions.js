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
    if (d3.event.target.checked) {
        updateScattersBySource(d3.event.target.name);
    } else {
        titleScatter.removeTrace(d3.event.target.name);
        descScatter.removeTrace(d3.event.target.name);
    }
}