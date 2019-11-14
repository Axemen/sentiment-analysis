class MultiBar {
    constructor(cssID, trace, margin = null) {

        this.cssID = cssID;
        this.svg = d3.select(`#${cssID}`).append('svg');

        if (!margin) {
            this.margin = {}
            this.margin.top = 10;
            this.margin.right = 20;
            this.margin.left = 30;
            this.margin.bottom = 20;
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
        // .attr('transform', d => `translate(${xGroupScale(d.source)}, 0)`)

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
            .attr('height', d =>  this.height - this.yScale(d.value))
            .attr('fill', d => this.colorScale(d.key));

    }
    /**
  * Translates the data from the current trace into a records based format for d3 consumption. 
  * 
  * @param {Object} trace -> An object that contains the values {x: [], y: [], name: <name>}
  */
    getDataFromTrace(trace) {
        let newData = []
        for (let i = 0; i < trace.y[0].length; i++) {
            let r = {}
            trace.x.forEach((key, j) => {
                r[key] = trace.y[j][i];
            })
            newData.push(r);
        }
        return newData;
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

    getYExtentOfTrace(trace) {
        let max = trace.y[0][0];
        let min = trace.y[0][0];

        for (let i = 0; i < trace.y.length; i++) {

            let currentMax = d3.max(trace.y[i], d => d);
            let currentMin = d3.min(trace.y[i], d => d);

            if (currentMax > max) {
                max = currentMax;
            }
            if (currentMin < min) {
                min = currentMin;
            }
        }
        return [min, max];
    }
    /**
     * Adds a trace to the current graph 
     * @param {Object} trace -> The trace that you wish to be added. 
     */
    addTrace(trace) {

        trace = this.checkTrace(trace);
        // Check that the incoming trace has a name and that said name is unique
        this.assert(trace.name, 'Trace must have a name!')
        this.assert(!this.traces.map(d => d.name).includes(trace.name),
            'Traces must have unique names!')
        // Append the trace to the Objects internal list of traces. 

        this.traces.push(trace);
        // Get the extents and check the set the domains of the Axis accordingly 
        this.extents = this.getExtentOfTraces(this.traces);
        this.xScale.domain(this.extents.x);
        // this.yScale.domain(this.extents.y);
        // Translate the data from the trace into the required d3 format.
        const traceData = this.getDataFromTrace(trace);
        // Append the new trace to the chartWrapper
        this.chartWrapper.selectAll(`.${trace.name}`)
            .data(traceData)
            .enter()
            .append('circle')
            .attr('class', `circle ${trace.name}`)
            .attr('cx', this.width * .6)
            .attr('cy', this.height * .5)
        // Call the render function to allow actually render the new circles on the screen. 
        this.render()
    }
    /**
     * Removes a trace from the graph and the traces list based on the name of the trace. 
     * @param {String} traceName -> The name of the trace that is to be removed. 
     */
    removeTrace(traceName) {
        // filters out the trace with the specified name and removes it from the graph 
        this.traces = this.traces.filter(d => d.name != traceName)
        this.svg.selectAll(`.${traceName}`)
            .transition()
            .attr('cx', this.width * .6)
            .attr('cy', this.height * .5)
            .remove();

        try {

            // Reset the extents and domain to adjust the graph to existing values 
            this.extents = this.getExtentOfTraces(this.traces);
            this.xScale.domain(this.extents.x);
            // this.yScale.domain(this.extents.y);

        } catch (TypeError) {

        }

        // renders the graph based on the new extents. 
        this.render();
    }
    /**
     * Sets default values for the trace if they do not yet exist and then returns the trace. 
     * @param {Object} trace -> The trace which we wish to check. 
     */
    checkTrace(trace) {

        let names = this.traces.map(d => d.name)
        if (names.includes(trace.name)) {
            var traceIndex = names.indexOf(trace.name);
        } else {
            var traceIndex = this.traces.length;
        }

        if (!trace.color) {
            trace.color = this.colorScale(traceIndex)
        }

        return trace;
    }


}