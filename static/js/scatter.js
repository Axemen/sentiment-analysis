class scatterPlot {

    constructor(cssID, traces = null, margin = null) {

        // Assign arguments to the object. 
        this.cssID = cssID;
        this.svg = d3.select(`#${cssID}`).append('svg');
        // If margin is null (no argument given) set a default margin
        if (!margin) {
            this.margin = {}
            this.margin.top = 10;
            this.margin.right = 20;
            this.margin.left = 40;
            this.margin.bottom = 20;
        } else {
            this.margin = margin;
        }

        // Translate trace data to a proper data format for d3
        this.traces = traces;
        this.init()
    }

    init() {
        this.extents = this.getExtentOfTraces(this.traces);
        this.xScale = d3.scaleTime()
            .domain(this.extents.x);
        this.yScale = d3.scaleLinear()
            .domain(this.extents.y);
        this.color = d3.scaleOrdinal(d3.schemeCategory10);

        this.xAxis = d3.axisBottom();
        this.yAxis = d3.axisLeft();

        this.chartWrapper = this.svg.append('g');
        this.chartWrapper.append('g')
            .classed('x axis', true)
            .style('font-size', '1rem');
        this.chartWrapper.append('g')
            .classed('y axis', true)
            .style('font-size', '1rem');

        this.chartWrapper
            .append('line')
            .attr('class', 'zero-line')

        this.traces.forEach(trace => {

            let data = this.getDataFromTrace(trace);

            this.chartWrapper.selectAll(`.${trace.name}`)
                .data(data)
                .enter()
                .append('circle')
                .attr('class', `circle ${trace.name}`);
        })

        this.render();
    }

    render() {
        this.parentElement = d3.select(`#${this.cssID}`);

        this.width = parseInt(this.parentElement.style('width')) - this.margin.left - this.margin.right;
        this.height = parseInt(this.parentElement.style('height'));

        if (this.width > this.height * 1.5) {
            this.width = this.height * 1.5;
        }

        this.svg
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom)

        this.chartWrapper.attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

        this.xScale.range([0, this.width]);
        this.yScale.range([this.height, 0]);

        this.xAxis.scale(this.xScale);
        this.yAxis.scale(this.yScale);

        this.svg.select('.x.axis')
            .transition()
            .attr('transform', `translate(0, ${this.height})`)
            .call(this.xAxis);
        this.svg.select('.y.axis')
            .transition()
            .call(this.yAxis);

        this.colorByName(this.traces.map(d => d.name));

        this.chartWrapper.select('.zero-line')
            .transition()
            .attr('x1', 0)
            .attr('y1', this.yScale(0))
            .attr('x2', this.width)
            .attr('y2', this.yScale(0))
            .attr('stroke-width', 1)
            .attr('stroke', 'grey');

        this.traces.forEach(trace => {
            let data = this.getDataFromTrace(trace);

            this.chartWrapper.selectAll(`.${trace.name}`)
                .data(data)
                .transition()
                .attr('cx', d => this.xScale(d.x))
                .attr('cy', d => this.yScale(d.y))
                .attr('r', '5px')
                .style('fill', '5px');
        })
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

    assert(condition, message) {
        if (!condition) {
            message = message || "Assertion failed";
            if (typeof Error !== "undefined") {
                throw new Error(message);
            }
            throw message; // Fallback
        }
    }

    colorByName(names) {
        names.forEach((name, i) => {
            this.chartWrapper.selectAll(`.${name}`)
                .style('fill', this.color(i))
        })
    }

    getExtentOfTrace(trace) {
        return { x: d3.extent(trace.x), y: d3.extent(trace.y) };
    }

    getExtentOfTraces(traces) {
        let extent = {}
        for (let i = 0; i < traces.length; i++) {
            let trace = traces[i];
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
        this.assert(trace.name, 'Trace must have a name!')
        this.assert(!this.traces.map(d => d.name).includes(trace.name),
            'Traces must have unique names!')

        this.traces.push(trace);

        this.extents = this.getExtentOfTraces(this.traces);
        this.xScale.domain(this.extents.x);
        this.yScale.domain(this.extents.y);

        const traceData = this.getDataFromTrace(trace);

        this.chartWrapper.selectAll(`.${trace.name}`)
            .data(traceData)
            .enter()
            .append('circle')
            .attr('class', `circle ${trace.name}`)
            .attr('cx', d => this.xScale(d.x))
            .attr('cy', d => this.yScale(d.y))
            .attr('r', '5px')
        this.render()
    }

    removeTrace(traceName) {
        this.traces = this.traces.filter(d => d.name != traceName)
        this.svg.selectAll(`.${traceName}`).remove();

        this.extents = this.getExtentOfTraces(this.traces);
        this.xScale.domain(this.extents.x);
        this.yScale.domain(this.extents.y);

        this.render();
    }


}