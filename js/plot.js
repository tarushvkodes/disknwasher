// Plot functionality for 2D function visualization
class FunctionPlotter {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.options = Object.assign({
            xMin: -5,
            xMax: 5,
            yMin: -5,
            yMax: 5,
            axisColor: '#888',
            gridColor: '#ddd',
            functionColor: '#2a69ac',
            secondFunctionColor: '#e74c3c',
            fillColor: 'rgba(127, 179, 213, 0.3)',
        }, options);
        
        this.chart = null;
        this.initChart();
    }
    
    initChart() {
        const ctx = document.createElement('canvas');
        ctx.width = this.container.clientWidth;
        ctx.height = this.container.clientHeight;
        this.container.appendChild(ctx);
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'linear',
                        position: 'center',
                        min: this.options.xMin,
                        max: this.options.xMax,
                        grid: {
                            color: this.options.gridColor,
                            borderColor: this.options.axisColor,
                            tickColor: this.options.axisColor
                        }
                    },
                    y: {
                        type: 'linear',
                        position: 'center',
                        min: this.options.yMin,
                        max: this.options.yMax,
                        grid: {
                            color: this.options.gridColor,
                            borderColor: this.options.axisColor,
                            tickColor: this.options.axisColor
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `(${context.parsed.x.toFixed(2)}, ${context.parsed.y.toFixed(2)})`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    evaluateFunction(funcStr, x) {
        try {
            // Replace common math functions with Math equivalents
            const scope = {
                x: x,
                sin: Math.sin,
                cos: Math.cos,
                tan: Math.tan,
                sqrt: Math.sqrt,
                abs: Math.abs,
                PI: Math.PI,
                E: Math.E
            };
            
            return math.evaluate(funcStr, scope);
        } catch (error) {
            console.error('Error evaluating function:', error);
            return NaN;
        }
    }
    
    plotFunction(funcStr, options = {}) {
        // Clear existing datasets if specified
        if (options.clear) {
            this.chart.data.datasets = [];
        }
        
        const color = options.color || this.options.functionColor;
        const label = options.label || 'f(x)';
        const fill = options.fill || false;
        const fillColor = options.fillColor || this.options.fillColor;
        
        // Generate data points
        const xMin = options.xMin || this.options.xMin;
        const xMax = options.xMax || this.options.xMax;
        const steps = options.steps || 100;
        const stepSize = (xMax - xMin) / steps;
        
        const data = [];
        for (let x = xMin; x <= xMax; x += stepSize) {
            const y = this.evaluateFunction(funcStr, x);
            if (!isNaN(y) && isFinite(y)) {
                data.push({ x, y });
            }
        }
        
        // Add the new dataset
        this.chart.data.datasets.push({
            label: label,
            data: data,
            borderColor: color,
            borderWidth: 2,
            pointRadius: 0,
            fill: fill,
            backgroundColor: fillColor,
            tension: 0.4
        });
        
        // Update the chart
        this.chart.update();
        
        return data; // Return the generated data for further processing
    }
    
    plotRegion(func1Str, func2Str, options = {}) {
        // Clear existing datasets if specified
        if (options.clear) {
            this.chart.data.datasets = [];
        }
        
        const xMin = options.xMin || this.options.xMin;
        const xMax = options.xMax || this.options.xMax;
        
        // Plot the first function
        const func1Data = this.plotFunction(func1Str, {
            color: this.options.functionColor,
            label: options.label1 || 'f(x)',
            xMin: xMin,
            xMax: xMax
        });
        
        // Plot the second function
        const func2Data = this.plotFunction(func2Str, {
            color: this.options.secondFunctionColor,
            label: options.label2 || 'g(x)',
            xMin: xMin,
            xMax: xMax
        });
        
        // Create a filled region between the functions
        const filledRegion = [];
        const steps = options.steps || 100;
        const stepSize = (xMax - xMin) / steps;
        
        for (let x = xMin; x <= xMax; x += stepSize) {
            const y1 = this.evaluateFunction(func1Str, x);
            const y2 = this.evaluateFunction(func2Str, x);
            
            if (!isNaN(y1) && !isNaN(y2) && isFinite(y1) && isFinite(y2)) {
                filledRegion.push({ x, y1, y2 });
            }
        }
        
        // Add the filled region dataset
        this.chart.data.datasets.push({
            label: 'Region',
            data: filledRegion.map(point => ({
                x: point.x,
                y: Math.max(point.y1, point.y2)
            })),
            borderColor: 'transparent',
            backgroundColor: this.options.fillColor,
            pointRadius: 0,
            fill: '+1'
        });
        
        this.chart.data.datasets.push({
            label: 'Region Bottom',
            data: filledRegion.map(point => ({
                x: point.x,
                y: Math.min(point.y1, point.y2)
            })),
            borderColor: 'transparent',
            backgroundColor: 'transparent',
            pointRadius: 0,
            fill: false
        });
        
        // Update the chart
        this.chart.update();
    }
    
    addRotationAxis(axis = 'x', value = 0, options = {}) {
        const color = options.color || '#f39c12';
        const width = options.width || 2;
        const dash = options.dash || [5, 5];
        
        let data = [];
        
        if (axis === 'x') {
            // Horizontal line at y = value
            data = [
                { x: this.options.xMin, y: value },
                { x: this.options.xMax, y: value }
            ];
        } else {
            // Vertical line at x = value
            data = [
                { x: value, y: this.options.yMin },
                { x: value, y: this.options.yMax }
            ];
        }
        
        this.chart.data.datasets.push({
            label: `${axis}-axis`,
            data: data,
            borderColor: color,
            borderWidth: width,
            borderDash: dash,
            pointRadius: 0,
            fill: false
        });
        
        this.chart.update();
    }
    
    clear() {
        this.chart.data.datasets = [];
        this.chart.update();
    }
    
    updateBounds(xMin, xMax, yMin, yMax) {
        this.options.xMin = xMin;
        this.options.xMax = xMax;
        this.options.yMin = yMin;
        this.options.yMax = yMax;
        
        this.chart.options.scales.x.min = xMin;
        this.chart.options.scales.x.max = xMax;
        this.chart.options.scales.y.min = yMin;
        this.chart.options.scales.y.max = yMax;
        
        this.chart.update();
    }
}

// Initialize plots when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize disk method plot
    if (document.getElementById('disk-method-plot')) {
        const diskPlot = new FunctionPlotter('disk-method-plot', {
            xMin: -0.5,
            xMax: 2.5,
            yMin: -0.5,
            yMax: 5
        });
        
        // Initial plot
        diskPlot.plotFunction('x^2', { clear: true });
        diskPlot.addRotationAxis('x', 0);
        
        // Set up the update button
        const diskUpdateBtn = document.getElementById('disk-update-btn');
        diskUpdateBtn.addEventListener('click', function() {
            const functionInput = document.getElementById('disk-function').value;
            const lowerBound = parseFloat(document.getElementById('disk-lower-bound').value);
            const upperBound = parseFloat(document.getElementById('disk-upper-bound').value);
            const rotationAxis = document.getElementById('disk-rotation-axis').value;
            
            diskPlot.clear();
            diskPlot.updateBounds(
                Math.min(-0.5, lowerBound - 1),
                Math.max(2.5, upperBound + 1),
                -0.5,
                Math.max(5, diskPlot.evaluateFunction(functionInput, upperBound) + 1)
            );
            
            diskPlot.plotFunction(functionInput, { clear: true });
            
            if (rotationAxis === 'x-axis') {
                diskPlot.addRotationAxis('x', 0);
            } else {
                diskPlot.addRotationAxis('y', 0);
            }
            
            // Update 3D model
            if (window.updateDiskModel) {
                window.updateDiskModel(functionInput, lowerBound, upperBound, rotationAxis);
            }
            
            // Update volume calculation
            if (window.updateDiskVolume) {
                window.updateDiskVolume(functionInput, lowerBound, upperBound, rotationAxis);
            }
        });
    }
    
    // Initialize washer method plot
    if (document.getElementById('washer-method-plot')) {
        const washerPlot = new FunctionPlotter('washer-method-plot', {
            xMin: -0.5,
            xMax: 7,
            yMin: -0.5,
            yMax: 3.5
        });
        
        // Initial plot
        washerPlot.plotRegion('2+sin(x)', '1', {
            xMin: 0,
            xMax: 2 * Math.PI,
            clear: true,
            label1: 'Outer: 2+sin(x)',
            label2: 'Inner: 1'
        });
        washerPlot.addRotationAxis('x', 0);
        
        // Set up the update button
        const washerUpdateBtn = document.getElementById('washer-update-btn');
        washerUpdateBtn.addEventListener('click', function() {
            const outerFunction = document.getElementById('washer-outer-function').value;
            const innerFunction = document.getElementById('washer-inner-function').value;
            const lowerBound = parseFloat(document.getElementById('washer-lower-bound').value);
            const upperBound = parseFloat(document.getElementById('washer-upper-bound').value);
            const rotationAxis = document.getElementById('washer-rotation-axis').value;
            
            washerPlot.clear();
            
            // Evaluate functions to determine y bounds
            let maxY = 3.5;
            for (let x = lowerBound; x <= upperBound; x += (upperBound - lowerBound) / 20) {
                const outerY = washerPlot.evaluateFunction(outerFunction, x);
                maxY = Math.max(maxY, outerY + 0.5);
            }
            
            washerPlot.updateBounds(
                Math.min(-0.5, lowerBound - 1),
                Math.max(7, upperBound + 1),
                -0.5,
                maxY
            );
            
            washerPlot.plotRegion(outerFunction, innerFunction, {
                xMin: lowerBound,
                xMax: upperBound,
                clear: true,
                label1: `Outer: ${outerFunction}`,
                label2: `Inner: ${innerFunction}`
            });
            
            if (rotationAxis === 'x-axis') {
                washerPlot.addRotationAxis('x', 0);
            } else {
                washerPlot.addRotationAxis('y', 0);
            }
            
            // Update 3D model
            if (window.updateWasherModel) {
                window.updateWasherModel(outerFunction, innerFunction, lowerBound, upperBound, rotationAxis);
            }
            
            // Update volume calculation
            if (window.updateWasherVolume) {
                window.updateWasherVolume(outerFunction, innerFunction, lowerBound, upperBound, rotationAxis);
            }
        });
    }
    
    // Initialize example plots
    if (document.getElementById('example1-plot')) {
        const example1Plot = new FunctionPlotter('example1-plot', {
            xMin: -0.5,
            xMax: 2.5,
            yMin: -0.5,
            yMax: 5
        });
        
        example1Plot.plotFunction('x^2', { clear: true });
        example1Plot.addRotationAxis('x', 0);
    }
    
    if (document.getElementById('example2-plot')) {
        const example2Plot = new FunctionPlotter('example2-plot', {
            xMin: -0.5,
            xMax: 1.5,
            yMin: -0.5,
            yMax: 1.5
        });
        
        example2Plot.plotRegion('x', 'x^2', {
            xMin: 0,
            xMax: 1,
            clear: true,
            label1: 'y = x',
            label2: 'y = x²'
        });
        example2Plot.addRotationAxis('y', 0);
    }
});