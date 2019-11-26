/* Example Trace
    let trace = {
        x = [1, 2, 3...],
        numBins = 10,
        color = 'steelblue'
    }
*/

class Histogram {

    constructor(cssID, trace, margin = null) {


        // Assign arguments to the object. 
        this.cssID = cssID;
        this.svg = d3.select(`#${cssID}`).append('svg');
        // If margin is null (no argument given) set a default margin
        if (!margin) {
            this.margin = {}
            this.margin.top = 10;
            this.margin.right = 20;
            this.margin.left = 30;
            this.margin.bottom = 20;
        } else {
            this.margin = margin;
        }
        // Translate trace data to a proper data format for d3
        this.trace(trace);
        // this.data = trace.x;
        this.init()
    }

    init() {


        this.xScale = d3.scaleLinear()
            .domain(d3.extent(this.trace().x)).nice()

        this.bins = d3.histogram()
            .domain(this.xScale.domain())
            .thresholds(this.xScale.ticks(this.trace().numBins))
            (this.trace().x);

        this.yScale = d3.scaleLinear()
            .domain([0, d3.max(this.bins, d => d.length)]).nice();

        this.xAxis = d3.axisBottom().ticks(this.trace().x.length);
        this.yAxis = d3.axisLeft();

        this.chartWrapper = this.svg.append('g');

        this.chartWrapper.selectAll('rect')
            .data(this.bins)
            .enter()
            .append('rect')
            .attr('class', 'bar');

        // Appending Axis' to chartWrapper
        this.chartWrapper.append('g')
            .classed('x axis', true)
        this.chartWrapper.append('g')
            .classed('y axis', true)

        this.render()
    }

    render() {
        this.parentElement = d3.select(`#${this.cssID}`);

        this.width = parseInt(this.parentElement.style('width')) - this.margin.left - this.margin.right;
        this.height = parseInt(this.parentElement.style('height')) - this.margin.top - this.margin.bottom;

        // if (this.width > this.height*1.5){
        //     this.width = this.height*1.5;
        // }

        this.svg
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom)

        this.chartWrapper.attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

        this.xScale.range([0, this.width]);
        this.yScale.range([this.height, 0]);
        
        this.xAxis.scale(this.xScale)
            .tickValues(this.xScale.ticks(this.numBins))
            .tickFormat(d3.format(".1f"));
        this.yAxis.scale(this.yScale);


        this.svg.select('.x.axis')
            .transition()
            .attr('transform', `translate(0, ${this.height})`)
            .call(this.xAxis)

        this.svg.select('.y.axis')
            .transition()
            .call(this.yAxis);

        // Transition bar y values
        this.svg.selectAll('rect')
            .data(this.bins)
            .transition()
            .attr('x', d => this.xScale(d.x0) + 1)
            .attr('y', d => this.yScale(d.length))
            .attr('height', d => this.yScale(0) - this.yScale(d.length))
            .attr('width', d => Math.max(0, this.xScale(d.x1) - this.xScale(d.x0) - 1))
            .style('fill', d => this.getColor(d.y));
    }

    updateBars(newTrace) {

        this.trace(newTrace);

        this.xScale = d3.scaleLinear()
            .domain(d3.extent(this.trace().x)).nice()

        this.bins = d3.histogram()
            .domain(this.xScale.domain())
            .thresholds(this.xScale.ticks(this.trace().numBins))
            (this.trace().x);

        this.yScale = d3.scaleLinear()
            .domain([0, d3.max(this.bins, d => d.length)]).nice();

        this.chartWrapper.selectAll('rect')
            .data(this.bins)
            .enter()
            .append('rect')
            .classed('bar', true);
        this.render()
    }

    getDataFromTrace(trace) {

        let newData = []
        for (let i = 0; i < trace.x.length; i++) {
            let d = {}
            d.x = trace.x[i];
            d.y = trace.y[i];
            newData.push(d);
        }
        return newData;
    }

    getColor(value) {

        if (value > 0) {
            return 'steelblue';
        }
        return 'darkorange';
    }

    xScale = (_) => {
        if (!_) return this.xScale;
        this.xScale = _;
        return this;
    }

    trace = (_) => {
        if (!_) return this.traceValue;
        this.traceValue = _;
        return this;
    }
}

