class MultiLine {

    constructor(cssID, traces, margin = null) {

        // Assign arguments to the object. 
        this.cssID = cssID;
        this.svg = d3.select(`#${cssID}`).append('svg');
        this.traces = traces;
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
        // this.data = this.translateTraces(this.traces);
        this.init();
    }

    init() {
        this.extents = this.getExtentOfCurrentTraces();
        this.xScale = d3.scaleLinear()
            .domain(this.extents.x);
        this.yScale = d3.scaleLinear()
            .domain(this.extents.y);
        this.color = d3.scaleOrdinal(d3.schemeCategory10);

        this.xAxis = d3.axisBottom();
        this.yAxis = d3.axisLeft();

        this.line = d3.line()
            .x(d => this.xScale(d.x))
            .y(d => this.yScale(d.y));

        this.chartWrapper = this.svg.append('g');
        this.chartWrapper.append('g').classed('x axis', true);
        this.chartWrapper.append('g').classed('y axis', true);

        // Appending line at zero in order to show the negative values in a better light. 
        this.chartWrapper
            .append('line')
            .attr('class', 'zero-line')

        // TODO: add Named Trace functionality.
        this.traces.forEach((trace, i) => {
            const traceData = this.getDataFromTrace(trace);

            trace.path = this.chartWrapper
                .datum(this.traceData)
                .append('path')
                .attr('class', `line ${trace.name}`);
        })

        this.render()
    }

    render() {

        this.parentElement = d3.select(`#${this.cssID}`);

        this.width = parseInt(this.parentElement.style('width')) - this.margin.left - this.margin.right;
        this.height = parseInt(this.parentElement.style('height'));

        this.xScale.range([0, this.width]);
        this.yScale.range([this.height, 0]);

        this.svg
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom);
        this.chartWrapper.attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

        this.xAxis.scale(this.xScale);
        this.yAxis.scale(this.yScale);

        this.svg.select('.x.axis')
            .transition()
            .attr('transform', `translate(0, ${this.height})`)
            .call(this.xAxis);
        this.svg.select('.y.axis')
            .transition()
            .call(this.yAxis);
        
        // Transition zero-line
        this.chartWrapper.select('.zero-line')
            .transition()
            .attr('x1', 0)
            .attr('y1', this.yScale(0))
            .attr('x2', this.width)
            .attr('y2', this.yScale(0))
            .attr('stroke-width', 1)
            .attr('stroke', 'grey');

        this.svg.selectAll('.line').style('stroke', (d, i) => this.color(i));

        this.traces.forEach(trace => {
            const traceData = this.getDataFromTrace(trace);
            trace.path
                .transition()
                .attr('d', this.line(traceData));
        })
    }

    getDataFromTrace(trace) {
        let traceData = [];
        for (let i = 0; i < trace.x.length; i++) {
            let d = {}
            d.x = trace.x[i];
            d.y = trace.y[i];
            traceData.push(d);
        }
        return traceData;
    }

    translateTraces(traces) {
        let translatedTraces = [];
        traces.forEach(trace => translatedTraces.push(this.getDataFromTrace(trace)));
        return translatedTraces;
    }

    getExtentOfTrace(trace) {
        return { x: d3.extent(trace.x), y: d3.extent(trace.y) };
    }

    getExtentOfCurrentTraces() {
        let extent = {}
        for (let i = 0; i < this.traces.length; i++) {
            let trace = this.traces[i];
            if (i == 0) {
                extent = this.getExtentOfTrace(trace);
            } else {
                let traceExtent = this.getExtentOfTrace(trace);

                if (extent.x[0] > traceExtent.x[0]) {
                    extent.x[0] = traceExtent.x[0];
                } else if (extent.x[1] < traceExtent.x[1]) {
                    extent.x[1] = traceExtent.x[1];
                }
                if (extent.y[0] > traceExtent.y[0]) {
                    extent.y[0] = traceExtent.y[0];
                } else if (extent.y[1] < traceExtent.y[1]) {
                    extent.y[1] = traceExtent.y[1];
                }
            }
        }
        return extent;
    }

    addTrace(trace) {
        console.log(trace);
        // Assertions to make sure the code runs properly. 
        this.assert(trace.name, 'Trace must have name!')
        this.assert(!this.traces.map(d => d.name).includes(trace.name), 'must have unique names!')

        this.traces.push(trace);

        this.extents = this.getExtentOfCurrentTraces();
        this.xScale.domain(this.extents.x);
        this.yScale.domain(this.extents.y);

        const traceData = this.getDataFromTrace(trace);
        // console.log(traceData);
        trace.path = this.chartWrapper
            .datum(traceData)
            .append('path')
            .attr('class', `line ${trace.name}`);

        this.render();
    }
    // Stolen from https://stackoverflow.com/questions/15313418/what-is-assert-in-javascript
    assert(condition, message) {
        if (!condition) {
            message = message || "Assertion failed";
            if (typeof Error !== "undefined") {
                throw new Error(message);
            }
            throw message; // Fallback
        }
    }
}
