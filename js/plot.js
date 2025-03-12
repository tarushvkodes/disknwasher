// Plot.js - Handles 2D curve plotting and initializes 3D visualization updates

document.addEventListener('DOMContentLoaded', function() {
    console.log('Plot.js loaded');
    
    // Wait for Chart.js to be available
    if (typeof Chart === 'undefined') {
        console.error('Chart.js not loaded');
        return;
    }
    
    // Initialize plots only after window is fully loaded
    if (document.readyState === 'complete') {
        initializePlots();
    } else {
        window.addEventListener('load', initializePlots);
    }
    
    function initializePlots() {
        // Initialize disk method plots and controls
        initDiskMethod();
        
        // Initialize washer method plots and controls
        initWasherMethod();
        
        // Initialize example plots
        initExamplePlots();
        
        // Initialize calculator visualization
        initCalculatorVisualizations();
    }
});

// Initialize the disk method visualization
function initDiskMethod() {
    const diskPlotContainer = document.getElementById('disk-method-plot');
    if (!diskPlotContainer) {
        console.warn('Disk method plot container not found');
        return;
    }
    
    console.log('Initializing disk method visualization');
    
    // Get the input elements
    const functionInput = document.getElementById('disk-function');
    const lowerBoundInput = document.getElementById('disk-lower-bound');
    const upperBoundInput = document.getElementById('disk-upper-bound');
    const rotationAxisSelect = document.getElementById('disk-rotation-axis');
    const updateButton = document.getElementById('disk-update-btn');
    const volumeResultDiv = document.getElementById('disk-volume-result');
    
    // Default values
    let currentFunction = 'x^2';
    let currentLowerBound = 0;
    let currentUpperBound = 2;
    let currentRotationAxis = 'x-axis';
    
    // Set initial input values if they're empty
    if (!functionInput.value) functionInput.value = currentFunction;
    if (!lowerBoundInput.value) lowerBoundInput.value = currentLowerBound;
    if (!upperBoundInput.value) upperBoundInput.value = currentUpperBound;
    
    // Create initial 2D plot
    createDiskMethodPlot();
    
    // Ensure 3D visualization is initialized (might have been created by 3d-models.js)
    setTimeout(() => {
        if (typeof window.updateDiskModel === 'function') {
            window.updateDiskModel(currentFunction, currentLowerBound, currentUpperBound, currentRotationAxis);
            console.log('Initial disk 3D model updated');
        } else {
            console.warn('updateDiskModel function not available');
            // Try to force create the 3D model
            const diskContainer = document.getElementById('disk-method-3d');
            if (diskContainer && typeof RevolutionVisualizer === 'function') {
                console.log('Creating disk visualizer directly from plot.js');
                try {
                    const diskVisualizer = new RevolutionVisualizer('disk-method-3d');
                    diskVisualizer.createDiskModel(currentFunction, currentLowerBound, currentUpperBound, currentRotationAxis);
                    
                    // Store the function for future updates
                    window.updateDiskModel = (funcStr, lowerBound, upperBound, rotationAxis) => {
                        console.log('Updating disk model:', funcStr, lowerBound, upperBound, rotationAxis);
                        diskVisualizer.createDiskModel(funcStr, lowerBound, upperBound, rotationAxis);
                    };
                } catch (error) {
                    console.error('Error creating disk visualizer:', error);
                }
            }
        }
    }, 1000);
    
    // Add event listener to the update button
    updateButton.addEventListener('click', function() {
        currentFunction = functionInput.value;
        currentLowerBound = parseFloat(lowerBoundInput.value);
        currentUpperBound = parseFloat(upperBoundInput.value);
        currentRotationAxis = rotationAxisSelect.value;
        
        console.log('Updating disk method visualization:', 
                    currentFunction, currentLowerBound, currentUpperBound, currentRotationAxis);
        
        // Update 2D plot
        createDiskMethodPlot();
        
        // Update 3D model
        if (typeof window.updateDiskModel === 'function') {
            window.updateDiskModel(currentFunction, currentLowerBound, currentUpperBound, currentRotationAxis);
        } else {
            console.warn('updateDiskModel function not available');
        }
        
        // Update volume calculation
        calculateDiskVolume();
    });
    
    // Calculate and display the initial volume
    calculateDiskVolume();
    
    // Function to create the disk method plot
    function createDiskMethodPlot() {
        // Generate points for plotting
        const plotPoints = [];
        const numPoints = 100;
        const step = (currentUpperBound - currentLowerBound) / numPoints;
        
        for (let i = 0; i <= numPoints; i++) {
            const x = currentLowerBound + i * step;
            try {
                const y = evaluateFunction(currentFunction, x);
                plotPoints.push({ x, y });
            } catch (error) {
                console.warn('Error evaluating function at x =', x, ':', error);
            }
        }
        
        // Create a new Chart.js plot
        if (window.diskMethodChart) {
            window.diskMethodChart.destroy();
        }
        
        const ctx = document.createElement('canvas');
        ctx.width = diskPlotContainer.clientWidth;
        ctx.height = 300;
        diskPlotContainer.innerHTML = '';
        diskPlotContainer.appendChild(ctx);
        
        window.diskMethodChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: `f(x) = ${currentFunction}`,
                    data: plotPoints,
                    borderColor: '#2a69ac',
                    backgroundColor: 'rgba(42, 105, 172, 0.2)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: {
                            display: true,
                            text: 'x'
                        }
                    },
                    y: {
                        type: 'linear',
                        title: {
                            display: true,
                            text: 'y'
                        }
                    }
                }
            }
        });
    }
    
    // Function to calculate the volume using disk method
    function calculateDiskVolume() {
        try {
            // Number of slices for numerical integration
            const numSlices = 1000;
            const dx = (currentUpperBound - currentLowerBound) / numSlices;
            
            let volume = 0;
            
            for (let i = 0; i < numSlices; i++) {
                const x = currentLowerBound + i * dx;
                const y = evaluateFunction(currentFunction, x);
                
                // For disk method, volume element is π * r^2 * dx
                // where r is the value of the function
                volume += Math.PI * y * y * dx;
            }
            
            // Display the result
            if (volumeResultDiv) {
                const formula = `\\( V = \\pi \\int_{${currentLowerBound}}^{${currentUpperBound}} (${currentFunction})^2 \\, dx \\approx ${volume.toFixed(2)} \\)`;
                volumeResultDiv.innerHTML = `<span class="math-inline">${formula}</span>`;
                
                // Update MathJax rendering
                if (window.MathJax) {
                    MathJax.typesetPromise([volumeResultDiv]).catch(err => console.error('MathJax error:', err));
                }
            }
        } catch (error) {
            console.error('Error calculating disk volume:', error);
            if (volumeResultDiv) {
                volumeResultDiv.textContent = `Error: ${error.message}`;
            }
        }
    }
}

// Initialize the washer method visualization
function initWasherMethod() {
    const washerPlotContainer = document.getElementById('washer-method-plot');
    if (!washerPlotContainer) {
        console.warn('Washer method plot container not found');
        return;
    }
    
    console.log('Initializing washer method visualization');
    
    // Get the input elements
    const outerFunctionInput = document.getElementById('washer-outer-function');
    const innerFunctionInput = document.getElementById('washer-inner-function');
    const lowerBoundInput = document.getElementById('washer-lower-bound');
    const upperBoundInput = document.getElementById('washer-upper-bound');
    const rotationAxisSelect = document.getElementById('washer-rotation-axis');
    const updateButton = document.getElementById('washer-update-btn');
    const volumeResultDiv = document.getElementById('washer-volume-result');
    
    // Default values
    let currentOuterFunction = '2+sin(x)';
    let currentInnerFunction = '1';
    let currentLowerBound = 0;
    let currentUpperBound = 2 * Math.PI;
    let currentRotationAxis = 'x-axis';
    
    // Set initial input values if they're empty
    if (!outerFunctionInput.value) outerFunctionInput.value = currentOuterFunction;
    if (!innerFunctionInput.value) innerFunctionInput.value = currentInnerFunction;
    if (!lowerBoundInput.value) lowerBoundInput.value = currentLowerBound;
    if (!upperBoundInput.value) upperBoundInput.value = currentUpperBound;
    
    // Create initial 2D plot
    createWasherMethodPlot();
    
    // Ensure 3D visualization is initialized (might have been created by 3d-models.js)
    setTimeout(() => {
        if (typeof window.updateWasherModel === 'function') {
            window.updateWasherModel(
                currentOuterFunction,
                currentInnerFunction,
                currentLowerBound,
                currentUpperBound,
                currentRotationAxis
            );
            console.log('Initial washer 3D model updated');
        } else {
            console.warn('updateWasherModel function not available');
            // Try to force create the 3D model
            const washerContainer = document.getElementById('washer-method-3d');
            if (washerContainer && typeof RevolutionVisualizer === 'function') {
                console.log('Creating washer visualizer directly from plot.js');
                try {
                    const washerVisualizer = new RevolutionVisualizer('washer-method-3d');
                    washerVisualizer.createWasherModel(
                        currentOuterFunction,
                        currentInnerFunction,
                        currentLowerBound,
                        currentUpperBound,
                        currentRotationAxis
                    );
                    
                    // Store the function for future updates
                    window.updateWasherModel = (outerFunc, innerFunc, lowerBound, upperBound, rotationAxis) => {
                        console.log('Updating washer model:', outerFunc, innerFunc, lowerBound, upperBound, rotationAxis);
                        washerVisualizer.createWasherModel(outerFunc, innerFunc, lowerBound, upperBound, rotationAxis);
                    };
                } catch (error) {
                    console.error('Error creating washer visualizer:', error);
                }
            }
        }
    }, 1000);
    
    // Add event listener to the update button
    updateButton.addEventListener('click', function() {
        currentOuterFunction = outerFunctionInput.value;
        currentInnerFunction = innerFunctionInput.value;
        currentLowerBound = parseFloat(lowerBoundInput.value);
        currentUpperBound = parseFloat(upperBoundInput.value);
        currentRotationAxis = rotationAxisSelect.value;
        
        // Handle special case of PI in input
        if (upperBoundInput.value.includes('PI')) {
            try {
                currentUpperBound = eval(upperBoundInput.value.replace('PI', 'Math.PI'));
            } catch (error) {
                console.error('Error parsing PI in upper bound:', error);
            }
        }
        
        console.log('Updating washer method visualization:', 
                    currentOuterFunction, currentInnerFunction, 
                    currentLowerBound, currentUpperBound, currentRotationAxis);
        
        // Update 2D plot
        createWasherMethodPlot();
        
        // Update 3D model
        if (typeof window.updateWasherModel === 'function') {
            window.updateWasherModel(
                currentOuterFunction,
                currentInnerFunction,
                currentLowerBound,
                currentUpperBound,
                currentRotationAxis
            );
        } else {
            console.warn('updateWasherModel function not available');
        }
        
        // Update volume calculation
        calculateWasherVolume();
    });
    
    // Calculate and display the initial volume
    calculateWasherVolume();
    
    // Function to create the washer method plot
    function createWasherMethodPlot() {
        // Generate points for plotting both functions
        const outerPoints = [];
        const innerPoints = [];
        const numPoints = 100;
        
        // Check for PI in bounds and convert
        let lowerBoundValue = currentLowerBound;
        let upperBoundValue = currentUpperBound;
        
        // Generate points for both functions
        const step = (upperBoundValue - lowerBoundValue) / numPoints;
        
        for (let i = 0; i <= numPoints; i++) {
            const x = lowerBoundValue + i * step;
            try {
                const outerY = evaluateFunction(currentOuterFunction, x);
                const innerY = evaluateFunction(currentInnerFunction, x);
                outerPoints.push({ x, y: outerY });
                innerPoints.push({ x, y: innerY });
            } catch (error) {
                console.warn('Error evaluating function at x =', x, ':', error);
            }
        }
        
        // Create a new Chart.js plot
        if (window.washerMethodChart) {
            window.washerMethodChart.destroy();
        }
        
        const ctx = document.createElement('canvas');
        ctx.width = washerPlotContainer.clientWidth;
        ctx.height = 300;
        washerPlotContainer.innerHTML = '';
        washerPlotContainer.appendChild(ctx);
        
        window.washerMethodChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: `Outer: f(x) = ${currentOuterFunction}`,
                        data: outerPoints,
                        borderColor: '#2a69ac',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: false
                    },
                    {
                        label: `Inner: g(x) = ${currentInnerFunction}`,
                        data: innerPoints,
                        borderColor: '#e74c3c',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: false
                    },
                    {
                        label: 'Region',
                        data: outerPoints,
                        borderColor: 'rgba(0,0,0,0)',
                        backgroundColor: 'rgba(42, 105, 172, 0.2)',
                        fill: '+1',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: {
                            display: true,
                            text: 'x'
                        }
                    },
                    y: {
                        type: 'linear',
                        title: {
                            display: true,
                            text: 'y'
                        }
                    }
                }
            }
        });
    }
    
    // Function to calculate the volume using washer method
    function calculateWasherVolume() {
        try {
            // Number of slices for numerical integration
            const numSlices = 1000;
            const dx = (currentUpperBound - currentLowerBound) / numSlices;
            
            let volume = 0;
            
            for (let i = 0; i < numSlices; i++) {
                const x = currentLowerBound + i * dx;
                const outerY = evaluateFunction(currentOuterFunction, x);
                const innerY = evaluateFunction(currentInnerFunction, x);
                
                // For washer method, volume element is π * (R^2 - r^2) * dx
                // where R is the outer radius and r is the inner radius
                volume += Math.PI * (outerY * outerY - innerY * innerY) * dx;
            }
            
            // Display the result
            if (volumeResultDiv) {
                const formula = `\\( V = \\pi \\int_{${currentLowerBound}}^{${currentUpperBound}} [(${currentOuterFunction})^2 - (${currentInnerFunction})^2] \\, dx \\approx ${volume.toFixed(2)} \\)`;
                volumeResultDiv.innerHTML = `<span class="math-inline">${formula}</span>`;
                
                // Update MathJax rendering
                if (window.MathJax) {
                    MathJax.typesetPromise([volumeResultDiv]).catch(err => console.error('MathJax error:', err));
                }
            }
        } catch (error) {
            console.error('Error calculating washer volume:', error);
            if (volumeResultDiv) {
                volumeResultDiv.textContent = `Error: ${error.message}`;
            }
        }
    }
}

// Helper function to evaluate a mathematical function string
function evaluateFunction(funcStr, value) {
    try {
        // Replace common math functions with Math equivalents
        const scope = {
            x: value,
            sin: Math.sin,
            cos: Math.cos,
            tan: Math.tan,
            sqrt: Math.sqrt,
            abs: Math.abs,
            PI: Math.PI,
            E: Math.E
        };
        
        const result = math.evaluate(funcStr, scope);
        return result;
    } catch (error) {
        console.error(`Error evaluating function ${funcStr} with value ${value}:`, error);
        throw error;
    }
}

// Initialize plots for the example problems
function initExamplePlots() {
    // This will be implemented to show example visualizations
}

// Initialize calculator visualizations
function initCalculatorVisualizations() {
    const plotContainer = document.getElementById('calc-plot');
    const formulaDiv = document.getElementById('calc-formula');
    const calculateBtn = document.getElementById('calculate-btn');
    const methodSelect = document.getElementById('calc-method');
    
    if (!plotContainer || !calculateBtn) {
        console.warn('Calculator plot container or button not found');
        return;
    }
    
    calculateBtn.addEventListener('click', function() {
        const method = methodSelect.value;
        const axis = document.getElementById('calc-axis').value;
        const lowerBound = parseFloat(document.getElementById('calc-lower').value);
        const upperBound = parseFloat(document.getElementById('calc-upper').value);
        
        let datasets = [];
        
        if (method === 'disk') {
            const funcStr = document.getElementById('calc-disk-function').value;
            datasets = createDiskMethodDatasets(funcStr, lowerBound, upperBound);
        } else {
            const outerFuncStr = document.getElementById('calc-washer-outer').value;
            const innerFuncStr = document.getElementById('calc-washer-inner').value;
            datasets = createWasherMethodDatasets(outerFuncStr, innerFuncStr, lowerBound, upperBound);
        }
        
        // Create plot
        createCalculatorPlot(datasets, plotContainer);
        
        // Create 3D visualization
        if (method === 'disk') {
            const funcStr = document.getElementById('calc-disk-function').value;
            createCalculator3DModel(funcStr, lowerBound, upperBound, axis);
        } else {
            const outerFuncStr = document.getElementById('calc-washer-outer').value;
            const innerFuncStr = document.getElementById('calc-washer-inner').value;
            createCalculator3DWasherModel(outerFuncStr, innerFuncStr, lowerBound, upperBound, axis);
        }
    });
    
    function createDiskMethodDatasets(funcStr, lowerBound, upperBound) {
        const plotPoints = [];
        const numPoints = 100;
        const step = (upperBound - lowerBound) / numPoints;
        
        for (let i = 0; i <= numPoints; i++) {
            const x = lowerBound + i * step;
            try {
                const y = evaluateFunction(funcStr, x);
                plotPoints.push({ x, y });
            } catch (error) {
                console.warn('Error evaluating function at x =', x, ':', error);
            }
        }
        
        return [{
            label: `f(x) = ${funcStr}`,
            data: plotPoints,
            borderColor: '#2a69ac',
            backgroundColor: 'rgba(42, 105, 172, 0.2)',
            fill: true,
            tension: 0.4
        }];
    }
    
    function createWasherMethodDatasets(outerFuncStr, innerFuncStr, lowerBound, upperBound) {
        const outerPoints = [];
        const innerPoints = [];
        const numPoints = 100;
        const step = (upperBound - lowerBound) / numPoints;
        
        for (let i = 0; i <= numPoints; i++) {
            const x = lowerBound + i * step;
            try {
                const outerY = evaluateFunction(outerFuncStr, x);
                const innerY = evaluateFunction(innerFuncStr, x);
                outerPoints.push({ x, y: outerY });
                innerPoints.push({ x, y: innerY });
            } catch (error) {
                console.warn('Error evaluating function at x =', x, ':', error);
            }
        }
        
        return [
            {
                label: `Outer: f(x) = ${outerFuncStr}`,
                data: outerPoints,
                borderColor: '#2a69ac',
                borderWidth: 2,
                tension: 0.4,
                fill: false
            },
            {
                label: `Inner: g(x) = ${innerFuncStr}`,
                data: innerPoints,
                borderColor: '#e74c3c',
                borderWidth: 2,
                tension: 0.4,
                fill: false
            },
            {
                label: 'Region',
                data: outerPoints,
                borderColor: 'rgba(0,0,0,0)',
                backgroundColor: 'rgba(42, 105, 172, 0.2)',
                fill: '+1',
                tension: 0.4
            }
        ];
    }
    
    function createCalculatorPlot(datasets, container) {
        // Destroy existing chart if it exists
        if (window.calculatorChart) {
            window.calculatorChart.destroy();
        }
        
        const ctx = document.createElement('canvas');
        ctx.width = container.clientWidth;
        ctx.height = container.clientHeight;
        container.innerHTML = '';
        container.appendChild(ctx);
        
        window.calculatorChart = new Chart(ctx, {
            type: 'line',
            data: { datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: {
                            display: true,
                            text: 'x'
                        }
                    },
                    y: {
                        type: 'linear',
                        title: {
                            display: true,
                            text: 'y'
                        }
                    }
                }
            }
        });
    }
    
    function createCalculator3DModel(funcStr, lowerBound, upperBound, axis) {
        const container = document.getElementById('calc-3d');
        if (!container) return;
        
        if (typeof RevolutionVisualizer === 'function') {
            try {
                if (!window.calculatorVisualizer) {
                    window.calculatorVisualizer = new RevolutionVisualizer('calc-3d');
                }
                window.calculatorVisualizer.createDiskModel(funcStr, lowerBound, upperBound, axis);
            } catch (error) {
                console.error('Error creating calculator 3D model:', error);
            }
        }
    }
    
    function createCalculator3DWasherModel(outerFuncStr, innerFuncStr, lowerBound, upperBound, axis) {
        const container = document.getElementById('calc-3d');
        if (!container) return;
        
        if (typeof RevolutionVisualizer === 'function') {
            try {
                if (!window.calculatorVisualizer) {
                    window.calculatorVisualizer = new RevolutionVisualizer('calc-3d');
                }
                window.calculatorVisualizer.createWasherModel(outerFuncStr, innerFuncStr, lowerBound, upperBound, axis);
            } catch (error) {
                console.error('Error creating calculator 3D washer model:', error);
            }
        }
    }
}