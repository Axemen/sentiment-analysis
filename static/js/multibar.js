class MultiBar {
    constructor(cssID, trace, margin = null) {

        this.cssID = cssID;
        this.svg = d3.select(`#${cssID}`).append('svg');

        if (!margin) {
            this.margin = {}
            this.margin.top = 10;
            this.margin.right = 20;
            this.margin.left = 30;
            this.margin.bottom = 40;
        } else {
            this.margin = margin;
        }

        this.data = trace;
        // this.data = this.getDataFromTrace(trace);
        this.colorScale = d3.scaleOrdinal(d3.schemeCategory10);
        this.init();
    }

    init() {

        this.keys = Object.keys(this.data[0]).filter(d => d !== 'source');

        this.xGroupScale = d3.scaleBand()
            .domain(this.data.map(d => d.source))
            .paddingInner(0.1);
        // .rangeRound([0, width])

        this.xScale = d3.scaleBand()
            .domain(this.keys)
            .padding(0.05);
        this.yScale = d3.scaleLinear()
            .domain([0, d3.max(this.data, d => d3.max(this.keys, key => d[key]))])
        this.colorScale = d3.scaleOrdinal()
            .range(['steelblue', 'darkorange']);

        this.xAxis = d3.axisBottom();
        this.yAxis = d3.axisLeft();

        this.chartWrapper = this.svg.append('g');

        this.groups = this.chartWrapper.append('g')
            .selectAll('g')
            .data(this.data)
            .enter()
            .append('g')
            .attr('class', 'group')

        this.groups.selectAll('rect')
            .data(d => this.keys.map(key => { return { key: key, value: d[key] } }))
            .enter()
            .append('rect');

        this.chartWrapper.append('g')
            .classed('y axis', true);
        this.chartWrapper.append('g')
            .classed('x axis', true);

        this.render();

    }

    render() {
        this.parentElement = d3.select(`#${this.cssID}`);

        this.width = parseInt(this.parentElement.style('width')) - this.margin.left - this.margin.right;
        this.height = parseInt(this.parentElement.style('height'));

        this.svg
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom);

        this.chartWrapper.attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

        this.xGroupScale
            .range([0, this.width]);
        this.xScale
            .rangeRound([0, this.xGroupScale.bandwidth()]);
        this.yScale
            .rangeRound([this.height, 0]);

        this.xAxis.scale(this.xGroupScale);
        this.yAxis.scale(this.yScale);

        this.svg.select('.x.axis')
            .transition()
            .attr('transform', `translate(0, ${this.height})`)
            .call(this.xAxis);
        this.svg.select('.y.axis')
            .transition()
            .call(this.yAxis);

        this.groups
            .attr('transform', d => `translate(${this.xGroupScale(d.source)}, 0)`)

        this.groups.selectAll('rect')
            .data(d => this.keys.map(key => { return { key: key, value: d[key] } }))
            .transition()
            .attr('x', d => this.xScale(d.key))
            .attr('y', d => this.yScale(d.value))
            .attr('width', this.xScale.bandwidth())
            .attr('height', d => this.height - this.yScale(d.value))
            .attr('fill', d => this.colorScale(d.key));

    }

    /**
     * An assertion function that will throw an error if the condition statement is true allowing 
     * the stopping of code if a variable is in an incorrect format.
     * 
     * @param {Boolean} condition -> the condition that you wish to assert 
     * @param {String} message -> the message that will appear in the error if the condition is true
     */
    assert(condition, message) {
        if (!condition) {
            message = message || "Assertion failed";
            if (typeof Error !== "undefined") {
                throw new Error(message);
            }
            throw message; // Fallback
        }
    }

    updateData(newData) {
        this.data = newData;
        this.keys = Object.keys(this.data[0]).filter(d => d !== 'source');

        this.xScale
            .domain(this.keys)
            .padding(0.05);
        this.yScale
            .domain([0, d3.max(this.data, d => d3.max(this.keys, key => d[key]))])

        this.groups
            .data(this.data);


        this.render();
    }

}