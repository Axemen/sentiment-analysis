class BarChart {

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
        this.traceValue = trace;
        this.data = this.getDataFromTrace(trace);
        this.init()

    }

    init() {

        this.yExtent = d3.extent(this.data, d => d.y);

        if (this.yExtent[0] > 0) {
            this.yExtent[0] = 0;
        }

        this.xScale = d3.scaleBand()
            .domain(this.trace().x)
            .padding(0.1);
        this.yScale = d3.scaleLinear()
            .domain(this.yExtent);

        this.xAxis = d3.axisBottom().ticks(this.trace().x.length);
        this.yAxis = d3.axisLeft();

        this.chartWrapper = this.svg.append('g');

        this.chartWrapper.selectAll('rect')
            .data(this.data)
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

        let ticks = this.xScale.domain();
        this.xAxis.scale(this.xScale).tickValues(ticks);
        this.yAxis.scale(this.yScale);


        this.svg.select('.x.axis')
            .transition()
            .attr('transform', `translate(0, ${this.height})`)
            .call(this.xAxis)
            .selectAll('text')
            .attr('y', '0')
            .attr('x', '9')
            .attr('dy', '.35em')
            .attr('transform', 'rotate(90)')
            .style('text-anchor', 'start')
            .style('font-size', '.8rem');
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
            .attr('width', () => this.xScale.bandwidth())
            .style('fill', d => this.getColor(d.y));
    }

    updateBars(newTrace) {
        if (newTrace) {
            this.data = this.getDataFromTrace(newTrace);
        } else {
            this.data = this.getDataFromTrace(this.trace());
        }

        this.yExtent = d3.extent(this.data, d => d.y);

        if (this.yExtent[0] > 0) {
            this.yExtent[0] = 0;
        }

        // Transition Scales to new data
        this.xScale
            .domain(this.data.map(d => d.x))
            .padding(0.1);
        this.yScale
            .domain(this.yExtent);

        this.chartWrapper.selectAll('rect')
            .data(this.data)
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

