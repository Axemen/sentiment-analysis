class scatterPlot {
    /**
     * @param {string} cssID -> Takes in the css id of the target div in order the plot the scatter
     * @param {object} margin -> Takes in an object with the keys top, bottom, left, and right in order to have custom margin options. 
     */
    constructor(cssID, traces = null, margin = null) {

        // Assign arguments to the object. 
        this.cssID = cssID;
        // Append svg and save selection to a variable. 
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
        // Creatin the colorscale in order to color the traces in an appropriate order. 
        this.colorScale = d3.scaleOrdinal()
            .domain(['#235789', '#ED1C24', '#F1D302', '#EC058E', '#85CB33']);

        
 
        traces.forEach((trace, i) => this.assert(trace.name, `Trace at index ${i} does not have a name!`))
        this.traces = traces;
        traces.forEach((trace, i) => this.checkTrace(trace))

        // Calls the init function to initialize the graph.
        this.init()
    }
    /**
     * The initializing funciton for the scatter plot.
     * This function creates and sizes the elemnents and variables required for the graph to render.  
     */
    init() {
        // Set extents using custom getExtentOfTraces which returns an object of the extents from multiple traces. 
        this.extents = this.getExtentOfTraces(this.traces);
        // Creating the scales and setting their domains based on the extent of all traces in the this.traces array. 
        this.xScale = d3.scaleTime()
            .domain(this.extents.x);
        this.yScale = d3.scaleLinear()
            // .domain(this.extents.y);
            .domain([-1, 1]);

        // Creating the functions for the Axis' that will later be appended. 
        this.xAxis = d3.axisBottom();
        this.yAxis = d3.axisLeft();
        // Creating the charWrapped which is essentially the area on the graph that will be plotted on. 
        this.chartWrapper = this.svg.append('g');
        // Appending the Axis' to the chartWrapper and doing a bit of styling. 
        this.chartWrapper.append('g')
            .classed('x axis', true)
        // .style('font-size', '1rem');
        this.chartWrapper.append('g')
            .classed('y axis', true)
        // .style('font-size', '1rem');
        // Appending a line that will sit on zero in case of negative values being plotted. (If there are no negative values it will merge with the x-axis.)
        this.chartWrapper
            .append('line')
            .attr('class', 'zero-line')
        // Iterate through the traces
        this.traces.forEach(trace => {
            // Translate the data from the trace in a record based version
            let data = this.getDataFromTrace(trace);
            // Select the css class for the trace.name which all of the scatter traces are based on. 
            this.chartWrapper.selectAll(`.${trace.name}`)
                .data(data) // Bind the trace data to the selection 
                .enter()    // .enter the selection to specify the elements that don't yet exist in the dom. 
                .append('circle')   // Append circles to each of the elements that have yet to be created.
                .attr('class', `circle ${trace.name}`) // Assign the class circle and trace.name to the individual circles for future selection needs.

        })

        this.render();
    }
    /**
     * Draws all elemnts on the page initially and also transitions them to new places based on the re-rendering of the page allowing the graph to be responsive. 
     */
    render() {
        // Selects the parent elemnt of the svg in order to get new width and height attributes.  
        this.parentElement = d3.select(`#${this.cssID}`);
        // calculate the new svg width and height based on the parent elements width and height.
        this.width = parseInt(this.parentElement.style('width')) - this.margin.left - this.margin.right;
        this.height = parseInt(this.parentElement.style('height')) - this.margin.top - this.margin.bottom;
        // If the width is big enough to distort the viewing of the graph set the width to be 1.5x the height of the graph
        // Giving us a functionality of an aspect ratio. 
        // if (this.width > this.height * 1.5) {
        //     this.width = this.height * 1.5;
        // }
        // Reset the svg's width and height to the values previously gotten from the parentElemnt. 
        this.svg
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom)
        // Reset the chartWrapper to the new svg. 
        this.chartWrapper.attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
        // Set the ranges of the xScale and yScale in order to allow for translating of the trace's data values. 
        this.xScale.range([0, this.width]);
        this.yScale.range([this.height, 0]);
        // reset the Axis' scales with the scales new ranges. 
        this.xAxis.scale(this.xScale);
        this.yAxis.scale(this.yScale);
        // Call transitions on the x and y axis to move them to their new positions and re-size them. 
        this.svg.select('.x.axis')
            .transition()
            .attr('transform', `translate(0, ${this.height})`)
            .call(this.xAxis);
        this.svg.select('.y.axis')
            .transition()
            .call(this.yAxis);
        // Color the traces based on their names. 
        // this.colorByName(this.traces.map(d => d.name));
        // Transition the zero-line to the new coordinates based on the new scales. 
        this.chartWrapper.select('.zero-line')
            .transition()
            .attr('x1', 0)
            .attr('y1', this.yScale(0))
            .attr('x2', this.width)
            .attr('y2', this.yScale(0))
            .attr('stroke-width', 1)
            .attr('stroke', 'grey');
        // Iterate through the traces in order for them to transition to their new locations. 
        this.traces.forEach(trace => {
            // Translate the data for the trace currently being iterated over. 
            let data = this.getDataFromTrace(trace);
            // select the circles for the corresponding trace and then transition them to their new locations. 
            this.chartWrapper.selectAll(`.${trace.name}`)
                .data(data)
                .transition()
                .attr('cx', d => this.xScale(d.x))
                .attr('cy', d => this.yScale(d.y))
                .attr('r', '5px')
                .style('fill', trace.color);
        })
    }

    /**
     * Translates the data from the current trace into a records based format for d3 consumption. 
     * 
     * @param {Object} trace -> An object that contains the values {x: [], y: [], name: 'name'}
     */
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

    /**
     * Returns the extents of the current trace object both x and y
     * @param {Object} trace -> the trace object in which to check the extents. 
     */
    getExtentOfTrace(trace) {
        return { x: d3.extent(trace.x), y: d3.extent(trace.y) };
    }
    /**
     * Iterates through an array of traces and returns the minimum and maximum values for both x and y.
     * @param {Array} traces -> the traces from which you wish to get the extents. 
     */
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
    /**
     * Adds a trace to the current graph 
     * @param {Object} trace -> The trace that you wish to be added. 
     */
    addTrace(trace) {

        trace = this.checkTrace(trace);
        // Check that the incoming trace has a name and that said name is unique
        if(this.traces.map(d => d.name).includes(trace.name)) {
            console.log('scatter Traces', this.traces);
            console.log('scatter Names', this.traces.map(d => d.name));
            console.log('titleTracesScatter', titleTracesScatter);
            console.log('descTracesScatter', descTracesScatter);
        }

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

    updateAllTraces(newTraces) {
        delete this.traces;
        this.traces = newTraces;
        this.render()
    }
}