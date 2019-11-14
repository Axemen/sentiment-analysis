let trace = [
    {
        source: 'cnn',
        pos: 10,
        neg: 20
    },
    {
        source: 'nbc-news',
        pos: 10,
        neg: 20
    }
]

bar = new MultiBar('bar', trace);

// .data(function(d) { return keys.map(function(key) { return {key: key, value: d[key]}; }); })

// .data(d => keys.map(key =>  {
//     return {key:key, value:d[key]}
// }))

window.addEventListener('resize', () => {
    bar.render();
})