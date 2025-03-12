// Calculator functionality for computing volumes
class VolumeCalculator {
    constructor() {
        // Numerical integration parameters
        this.defaultSteps = 1000;
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
    
    // Numerical integration using Simpson's rule
    integrate(func, lowerBound, upperBound, steps = this.defaultSteps) {
        const h = (upperBound - lowerBound) / steps;
        let sum = func(lowerBound) + func(upperBound);
        
        for (let i = 1; i < steps; i++) {
            const x = lowerBound + i * h;
            sum += (i % 2 === 0 ? 2 : 4) * func(x);
        }
        
        return (h / 3) * sum;
    }
    
    // Calculate volume using disk method
    diskMethodVolume(funcStr, lowerBound, upperBound, rotationAxis) {
        if (rotationAxis === 'x-axis') {
            // Rotation around x-axis: V = π∫[a,b] [f(x)]^2 dx
            const integrand = (x) => {
                const y = this.evaluateFunction(funcStr, x);
                return y * y;
            };
            
            return Math.PI * this.integrate(integrand, lowerBound, upperBound);
        } else {
            // Rotation around y-axis: V = 2π∫[a,b] x*f(x) dx
            const integrand = (x) => {
                const y = this.evaluateFunction(funcStr, x);
                return x * y;
            };
            
            return 2 * Math.PI * this.integrate(integrand, lowerBound, upperBound);
        }
    }
    
    // Calculate volume using washer method
    washerMethodVolume(outerFuncStr, innerFuncStr, lowerBound, upperBound, rotationAxis) {
        if (rotationAxis === 'x-axis') {
            // Rotation around x-axis: V = π∫[a,b] [f(x)^2 - g(x)^2] dx
            const integrand = (x) => {
                const outerY = this.evaluateFunction(outerFuncStr, x);
                const innerY = this.evaluateFunction(innerFuncStr, x);
                return outerY * outerY - innerY * innerY;
            };
            
            return Math.PI * this.integrate(integrand, lowerBound, upperBound);
        } else {
            // Rotation around y-axis: V = 2π∫[a,b] [x*f(x) - x*g(x)] dx
            const integrand = (x) => {
                const outerY = this.evaluateFunction(outerFuncStr, x);
                const innerY = this.evaluateFunction(innerFuncStr, x);
                return x * (outerY - innerY);
            };
            
            return 2 * Math.PI * this.integrate(integrand, lowerBound, upperBound);
        }
    }
    
    // Get LaTeX representation of the calculation
    getDiskMethodLatex(funcStr, lowerBound, upperBound, rotationAxis) {
        if (rotationAxis === 'x-axis') {
            return `V = \\pi \\int_{${lowerBound}}^{${upperBound}} [${funcStr}]^2 \\, dx`;
        } else {
            return `V = 2\\pi \\int_{${lowerBound}}^{${upperBound}} x \\cdot (${funcStr}) \\, dx`;
        }
    }
    
    getWasherMethodLatex(outerFuncStr, innerFuncStr, lowerBound, upperBound, rotationAxis) {
        if (rotationAxis === 'x-axis') {
            return `V = \\pi \\int_{${lowerBound}}^{${upperBound}} [(${outerFuncStr})^2 - (${innerFuncStr})^2] \\, dx`;
        } else {
            return `V = 2\\pi \\int_{${lowerBound}}^{${upperBound}} x \\cdot [(${outerFuncStr}) - (${innerFuncStr})] \\, dx`;
        }
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const calculator = new VolumeCalculator();
    
    // Update disk volume result
    window.updateDiskVolume = (funcStr, lowerBound, upperBound, rotationAxis) => {
        const volumeResult = calculator.diskMethodVolume(funcStr, lowerBound, upperBound, rotationAxis);
        const formula = calculator.getDiskMethodLatex(funcStr, lowerBound, upperBound, rotationAxis);
        
        const resultElement = document.getElementById('disk-volume-result');
        if (resultElement) {
            resultElement.innerHTML = `<span class="math-inline">\\( ${formula} = ${volumeResult.toFixed(4)} \\)</span>`;
            
            // Render the LaTeX
            if (window.MathJax) {
                MathJax.typeset([resultElement]);
            }
        }
    };
    
    // Update washer volume result
    window.updateWasherVolume = (outerFuncStr, innerFuncStr, lowerBound, upperBound, rotationAxis) => {
        const volumeResult = calculator.washerMethodVolume(outerFuncStr, innerFuncStr, lowerBound, upperBound, rotationAxis);
        const formula = calculator.getWasherMethodLatex(outerFuncStr, innerFuncStr, lowerBound, upperBound, rotationAxis);
        
        const resultElement = document.getElementById('washer-volume-result');
        if (resultElement) {
            resultElement.innerHTML = `<span class="math-inline">\\( ${formula} = ${volumeResult.toFixed(4)} \\)</span>`;
            
            // Render the LaTeX
            if (window.MathJax) {
                MathJax.typeset([resultElement]);
            }
        }
    };
    
    // Handle calculator form submissions
    const calculateBtn = document.getElementById('calculate-btn');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', function() {
            const method = document.getElementById('calc-method').value;
            const rotationAxis = document.getElementById('calc-axis').value;
            const lowerBound = parseFloat(document.getElementById('calc-lower').value);
            const upperBound = parseFloat(document.getElementById('calc-upper').value);
            
            let formula = '';
            let steps = '';
            let result = 0;
            
            if (method === 'disk') {
                const funcStr = document.getElementById('calc-disk-function').value;
                result = calculator.diskMethodVolume(funcStr, lowerBound, upperBound, rotationAxis);
                formula = calculator.getDiskMethodLatex(funcStr, lowerBound, upperBound, rotationAxis);
                
                // Generate steps for the calculation
                steps = `
                    \\begin{align}
                    V &= ${formula} \\\\
                    &= ${result.toFixed(4)}
                    \\end{align}
                `;
            } else {
                const outerFuncStr = document.getElementById('calc-washer-outer').value;
                const innerFuncStr = document.getElementById('calc-washer-inner').value;
                result = calculator.washerMethodVolume(outerFuncStr, innerFuncStr, lowerBound, upperBound, rotationAxis);
                formula = calculator.getWasherMethodLatex(outerFuncStr, innerFuncStr, lowerBound, upperBound, rotationAxis);
                
                // Generate steps for the calculation
                steps = `
                    \\begin{align}
                    V &= ${formula} \\\\
                    &= ${result.toFixed(4)}
                    \\end{align}
                `;
            }
            
            // Update the results
            document.getElementById('calc-formula').innerHTML = `$${formula}$`;
            document.getElementById('calc-steps').innerHTML = `$${steps}$`;
            document.getElementById('calc-result').innerHTML = `Volume = ${result.toFixed(4)}`;
            
            // Render LaTeX
            if (window.MathJax) {
                MathJax.typeset(['#calc-formula', '#calc-steps']);
            }
        });
    }
});