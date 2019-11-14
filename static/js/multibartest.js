let data = [
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

var svg = d3.select("#bar").append('svg')
    .attr('height', 500)
    .attr('width', 960);

var margin = { top: 20, right: 20, bottom: 30, left: 40 },
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    chartWrapper = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");


let xGroupScale = d3.scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.1);

let xScale = d3.scaleBand()
    .padding(0.05);

let yScale = d3.scaleLinear()
    .rangeRound([height, 0]);

let colorScale = d3.scaleOrdinal()
    .range(['steelblue', 'darkorange']);

console.log(data);


let keys = Object.keys(data[0]).filter(d => d !== 'source');

xGroupScale.domain(data.map(d => d.source));
xScale.domain(keys).rangeRound([0, xGroupScale.bandwidth()]);
yScale.domain([0, d3.max(data, d => d3.max(keys, key => d[key]))])

let groups = chartWrapper.append('g')
    .selectAll('g')
    .data(data)
    .enter().append('g')
    .attr('class', 'bar')
    .attr('transform', d => `translate(${xGroupScale(d.source)}, 0)`)


groups
    .selectAll('rect')
    .data(d => keys.map(key => {
        console.log({ key: key, value: d[key] })
        return { key: key, value: d[key] }
    }))
    .enter()
    .append('rect')
    .attr('x', d => xScale(d.key))
    .attr('y', d => yScale(d.value))
    .attr('width', xScale.bandwidth())
    // Math.abs(this.yScale(d.y) - this.yScale(0))
    .attr("height", function(d) { return height - yScale(d.value); })
    .attr('fill', d => colorScale(d.key));

chartWrapper.append('g')
    .attr('class', 'y axis')
    .call(d3.axisLeft(yScale));

chartWrapper.append('g')
    .attr('class', 'x axis')
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(xGroupScale));