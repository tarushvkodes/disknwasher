// 3D visualization using Three.js
class RevolutionVisualizer {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.solid = null;
        
        this.init();
        this.animate();
    }
    
    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xffffff);
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75, 
            this.container.clientWidth / this.container.clientHeight, 
            0.1, 
            1000
        );
        this.camera.position.set(5, 5, 5);
        this.camera.lookAt(0, 0, 0);
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.container.appendChild(this.renderer.domElement);
        
        // Add orbit controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        
        // Add lights
        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);
        
        // Add axes helper
        const axesHelper = new THREE.AxesHelper(5);
        this.scene.add(axesHelper);
        
        // Add grid
        const gridHelper = new THREE.GridHelper(10, 10);
        gridHelper.rotation.x = Math.PI / 2;
        this.scene.add(gridHelper);
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        });
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
    
    evaluateFunction(funcStr, value) {
        try {
            // Replace common math functions with Math equivalents
            const scope = {
                x: value,
                y: value,
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
    
    createDiskModel(funcStr, lowerBound, upperBound, axis = 'x-axis') {
        // Clear existing solid
        if (this.solid) {
            this.scene.remove(this.solid);
            this.solid = null;
        }
        
        // Create a group to hold the disks
        this.solid = new THREE.Group();
        
        // Number of disks to create
        const numDisks = 50;
        const stepSize = (upperBound - lowerBound) / numDisks;
        
        // Material for disks
        const material = new THREE.MeshPhongMaterial({
            color: 0x2a69ac,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        
        // Create disks
        for (let i = 0; i < numDisks; i++) {
            const value = lowerBound + i * stepSize;
            const nextValue = value + stepSize;
            
            // Calculate radius based on the function
            const radius = this.evaluateFunction(funcStr, value);
            const nextRadius = this.evaluateFunction(funcStr, nextValue);
            
            // Skip if radius is invalid
            if (isNaN(radius) || isNaN(nextRadius) || radius < 0 || nextRadius < 0) {
                continue;
            }
            
            // Create a truncated cone (cylinder with different radii)
            const geometry = new THREE.CylinderGeometry(
                radius, 
                nextRadius, 
                stepSize, 
                32, 
                1, 
                false
            );
            
            const disk = new THREE.Mesh(geometry, material);
            
            // Position the disk based on axis of rotation
            if (axis === 'x-axis') {
                disk.rotation.z = Math.PI / 2;
                disk.position.x = value + stepSize / 2;
            } else {
                disk.position.y = value + stepSize / 2;
            }
            
            this.solid.add(disk);
        }
        
        // Add the solid to the scene
        this.scene.add(this.solid);
    }
    
    createWasherModel(outerFuncStr, innerFuncStr, lowerBound, upperBound, axis = 'x-axis') {
        // Clear existing solid
        if (this.solid) {
            this.scene.remove(this.solid);
            this.solid = null;
        }
        
        // Create a group to hold the washers
        this.solid = new THREE.Group();
        
        // Number of washers to create
        const numWashers = 50;
        const stepSize = (upperBound - lowerBound) / numWashers;
        
        // Materials for washers
        const material = new THREE.MeshPhongMaterial({
            color: 0x2a69ac,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        
        // Create washers
        for (let i = 0; i < numWashers; i++) {
            const value = lowerBound + i * stepSize;
            const nextValue = value + stepSize;
            
            // Calculate outer radius based on the function
            const outerRadius = this.evaluateFunction(outerFuncStr, value);
            const nextOuterRadius = this.evaluateFunction(outerFuncStr, nextValue);
            
            // Calculate inner radius based on the function
            const innerRadius = this.evaluateFunction(innerFuncStr, value);
            const nextInnerRadius = this.evaluateFunction(innerFuncStr, nextValue);
            
            // Skip if any radius is invalid
            if (isNaN(outerRadius) || isNaN(nextOuterRadius) || isNaN(innerRadius) || isNaN(nextInnerRadius)) {
                continue;
            }
            
            // Create a custom geometry for the washer (like a tube)
            const ringGeometry = this.createWasherGeometry(
                outerRadius, 
                nextOuterRadius, 
                innerRadius, 
                nextInnerRadius, 
                stepSize
            );
            
            const washer = new THREE.Mesh(ringGeometry, material);
            
            // Position the washer based on axis of rotation
            if (axis === 'x-axis') {
                washer.rotation.z = Math.PI / 2;
                washer.position.x = value + stepSize / 2;
            } else {
                washer.position.y = value + stepSize / 2;
            }
            
            this.solid.add(washer);
        }
        
        // Add the solid to the scene
        this.scene.add(this.solid);
    }
    
    createWasherGeometry(outerRadius1, outerRadius2, innerRadius1, innerRadius2, height) {
        // Create geometries for inner and outer cylinders
        const outerCylinder = new THREE.CylinderGeometry(
            outerRadius1,
            outerRadius2,
            height,
            32,
            1,
            false
        );
        
        const innerCylinder = new THREE.CylinderGeometry(
            innerRadius1,
            innerRadius2,
            height + 0.01, // Slightly larger to ensure complete subtraction
            32,
            1,
            false
        );
        
        // Since CSG operations are complex and not built into Three.js,
        // we'll use a simpler approach with two cylinders
        
        // Create outer cylinder mesh
        const outerMesh = new THREE.Mesh(outerCylinder);
        
        // Create inner cylinder mesh with different material for visual distinction
        const innerMaterial = new THREE.MeshPhongMaterial({
            color: 0x7fb3d5,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        
        const innerMesh = new THREE.Mesh(innerCylinder, innerMaterial);
        
        // Return the outer geometry for now (in a real implementation we'd subtract inner from outer)
        return outerCylinder;
    }
}

// Initialize 3D visualizations when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if THREE.js is loaded
    if (typeof THREE === 'undefined') {
        console.error('THREE.js is not loaded. Please include it in your HTML file.');
        return;
    }
    
    // Load orbit controls if not included in the main Three.js
    if (!THREE.OrbitControls) {
        console.warn('OrbitControls not found. Loading from CDN...');
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js';
        document.head.appendChild(script);
        
        // Wait for script to load before initializing visualizations
        script.onload = initVisualizations;
    } else {
        initVisualizations();
    }
    
    function initVisualizations() {
        // Initialize disk method visualizer
        let diskVisualizer;
        if (document.getElementById('disk-method-3d')) {
            diskVisualizer = new RevolutionVisualizer('disk-method-3d');
            diskVisualizer.createDiskModel('x^2', 0, 2, 'x-axis');
            
            // Add to window object for access from plot.js
            window.updateDiskModel = (funcStr, lowerBound, upperBound, rotationAxis) => {
                diskVisualizer.createDiskModel(funcStr, lowerBound, upperBound, rotationAxis);
            };
        }
        
        // Initialize washer method visualizer
        let washerVisualizer;
        if (document.getElementById('washer-method-3d')) {
            washerVisualizer = new RevolutionVisualizer('washer-method-3d');
            washerVisualizer.createWasherModel('2+sin(x)', '1', 0, 2 * Math.PI, 'x-axis');
            
            // Add to window object for access from plot.js
            window.updateWasherModel = (outerFunc, innerFunc, lowerBound, upperBound, rotationAxis) => {
                washerVisualizer.createWasherModel(outerFunc, innerFunc, lowerBound, upperBound, rotationAxis);
            };
        }
    }
});