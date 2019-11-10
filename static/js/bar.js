class BarChart {

    constructor(cssID, trace, margin = null) {

        // Assign arguments to the object. 
        this.cssID = cssID;
        this.svg = d3.select(`#${cssID}`).append('svg');
        this.parentElement = d3.select(`#${this.cssID}`);
        // If margin is null (no argument given) set a default margin
        if (!margin) {
            this.margin = {}
            this.margin.top = 10;
            this.margin.right = 0;
            this.margin.left = 20;
            this.margin.bottom = 20;
        } else {
            this.margin = margin;
        }
        // Translate trace data to a proper data format for d3
        this.data = this.getDataFromTrace(trace);
        this.init()
    }

    init() {

        this.yExtent = d3.extent(this.data, d => d.y);
        // this.xExtent = d3.extent(this.data, d => d.x);

        if (this.yExtent[0] > 0) {
            this.yExtent[0] = 0;
        }

        this.xScale = d3.scaleBand()
            .domain(this.data.map(d => d.x))
            .padding(0.1);
        this.yScale = d3.scaleLinear()
            .domain(this.yExtent);

        this.xAxis = d3.axisBottom().ticks(11);
        this.yAxis = d3.axisLeft();

        this.chartWrapper = this.svg.append('g');


        this.chartWrapper.selectAll('rect')
            .data(this.data)
            .enter()
            .append('rect')
            .attr('class', 'bar');

        this.chartWrapper.append('g').classed('x axis', true);
        this.chartWrapper.append('g').classed('y axis', true);

        this.render()
    }

    render() {
        this.parentElement = d3.select(`#${this.cssID}`);

        this.width = parseInt(this.parentElement.style('width')) - this.margin.left - this.margin.right;
        this.height = parseInt(this.parentElement.style('height'));
        // this.width = 1.25 * this.height;

        this.svg
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom);
        this.chartWrapper.attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

        this.xScale.range([0, this.width]);
        this.yScale.range([this.height, 0]);

        this.xAxis.scale(this.xScale);
        this.yAxis.scale(this.yScale);


        this.svg.select('.x.axis')
            .transition()
            .attr('transform', `translate(0, ${this.yScale(0)})`)
            .call(this.xAxis);
        this.svg.select('.y.axis')
            .transition()
            .call(this.yAxis);

        // Transition bar y values
        this.svg.selectAll('rect')
            .data(this.data)
            .transition()
            .attr('x', d => this.xScale(d.x))
            .attr('y', d => this.yScale(Math.max(0, d.y)))
            .attr('height', d => Math.abs(this.yScale(d.y) - this.yScale(0)))
            .attr('width', d => this.xScale.bandwidth())
            .style('fill', d => this.getColor(d.y));
    }

    updateBars(newTrace) {

        this.data = this.getDataFromTrace(newTrace);

        this.yExtent = d3.extent(this.data, d => d.y);
        // this.xExtent = d3.extent(this.data, d => d.x);

        if (this.yExtent[0] > 0) {
            this.yExtent[0] = 0;
        }

        // Transition Scales to new data
        this.xScale
            .domain(this.data.map(d => d.x))
            .padding(0.1);
        this.yScale
            .domain(this.yExtent);

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
        return 'crimson';
    }
}

