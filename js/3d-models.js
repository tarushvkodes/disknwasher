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
        this.rotationAxis = 'x-axis';
        
        this.init();
        this.animate();
    }
    
    init() {
        console.log(`Initializing 3D scene for ${this.containerId}`);
        
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xffffff);
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            60, 
            this.container.clientWidth / this.container.clientHeight, 
            0.1, 
            1000
        );
        this.camera.position.set(5, 5, 5);
        this.camera.lookAt(0, 0, 0);
        
        // Create renderer with explicit precision setting
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true,
            precision: 'highp',
            powerPreference: 'high-performance'
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.container.innerHTML = ''; // Clear any previous content
        this.container.appendChild(this.renderer.domElement);
        
        // Add orbit controls
        if (typeof THREE.OrbitControls !== 'undefined') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
        } else {
            console.warn('OrbitControls not available');
        }
        
        // Add lights
        const ambientLight = new THREE.AmbientLight(0x606060);
        this.scene.add(ambientLight);
        
        const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight1.position.set(1, 1, 1);
        this.scene.add(directionalLight1);
        
        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight2.position.set(-1, -1, -1);
        this.scene.add(directionalLight2);
        
        // Add a point light to enhance visibility
        const pointLight = new THREE.PointLight(0xffffff, 1, 100);
        pointLight.position.set(0, 5, 5);
        this.scene.add(pointLight);
        
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
        
        // Add a simple indicator cube to confirm rendering works
        const cube = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.5, 0.5),
            new THREE.MeshBasicMaterial({ color: 0xff0000 })
        );
        cube.position.set(0, 0, 0);
        this.scene.add(cube);
        
        // Remove cube after 1 second
        setTimeout(() => {
            this.scene.remove(cube);
        }, 1000);
    }
    
    animate() {
        const animate = () => {
            requestAnimationFrame(animate);
            
            // Update controls if available
            if (this.controls) {
                this.controls.update();
            }
            
            this.renderer.render(this.scene, this.camera);
        };
        
        animate();
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
            
            const result = math.evaluate(funcStr, scope);
            return result;
        } catch (error) {
            console.error(`Error evaluating function ${funcStr} with value ${value}:`, error);
            return 0;
        }
    }
    
    createDiskModel(funcStr, lowerBound, upperBound, axis = 'x-axis') {
        console.log(`Creating disk model for: ${funcStr} from ${lowerBound} to ${upperBound} on ${axis}`);
        
        // Set the rotation axis for reference during animations
        this.rotationAxis = axis;
        
        // Convert bounds to numbers if they're strings
        lowerBound = parseFloat(lowerBound);
        upperBound = parseFloat(upperBound);
        
        // Clear existing solid
        if (this.solid) {
            this.scene.remove(this.solid);
            this.solid.traverse(object => {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(m => m.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
        }
        
        // Create a group to hold the disks
        this.solid = new THREE.Group();
        
        // Number of disks to create
        const numDisks = 40;
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
            const x = lowerBound + i * stepSize;
            const radius = this.evaluateFunction(funcStr, x);
            
            // Safety checks
            if (isNaN(radius) || !isFinite(radius) || radius < 0) continue;
            
            try {
                // Create a flat disk with radius equal to function value
                const geometry = new THREE.CylinderGeometry(
                    radius,    // top radius = function value
                    radius,    // bottom radius = function value
                    0.05,      // very thin height for flat disk
                    32,        // segments
                    1,
                    false
                );
                
                const disk = new THREE.Mesh(geometry, material);
                
                // Position the disk based on axis of rotation
                if (axis === 'x-axis') {
                    disk.position.set(x, 0, 0);
                    disk.rotation.z = Math.PI / 2;
                } else {
                    disk.position.set(0, x, 0);
                    disk.rotation.x = Math.PI / 2;
                }
                
                this.solid.add(disk);
            } catch (error) {
                console.error('Error creating disk:', error);
            }
        }
        
        // Add the solid to the scene
        this.scene.add(this.solid);
        
        // Adjust camera position based on maximum radius
        const cameraDistance = Math.max(10, this.rotationAxis === 'x-axis' ? upperBound * 3 : 10);
        this.camera.position.set(cameraDistance, cameraDistance, cameraDistance);
        this.camera.lookAt(0, 0, 0);
        
        if (this.controls) {
            this.controls.update();
        }
    }
    
    createWasherModel(outerFuncStr, innerFuncStr, lowerBound, upperBound, axis = 'x-axis') {
        console.log(`Creating washer model for: outer=${outerFuncStr}, inner=${innerFuncStr} from ${lowerBound} to ${upperBound} on ${axis}`);
        
        // Set the rotation axis for reference during animations
        this.rotationAxis = axis;
        
        // Convert bounds to numbers if they're strings
        lowerBound = parseFloat(lowerBound);
        upperBound = parseFloat(upperBound);
        
        // Check if PI is in the bounds and convert
        if (String(upperBound).includes('PI')) {
            upperBound = eval(String(upperBound).replace('PI', 'Math.PI'));
        }
        if (String(lowerBound).includes('PI')) {
            lowerBound = eval(String(lowerBound).replace('PI', 'Math.PI'));
        }
        
        console.log(`Parsed bounds: ${lowerBound} to ${upperBound}`);
        
        // Clear existing solid
        if (this.solid) {
            this.scene.remove(this.solid);
            this.solid.traverse(object => {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(m => m.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
        }
        
        // Create a group to hold all the washer parts
        this.solid = new THREE.Group();
        
        // Number of washers to create
        const numWashers = 40;
        const stepSize = (upperBound - lowerBound) / numWashers;
        
        // Material for outer part
        const outerMaterial = new THREE.MeshPhongMaterial({
            color: 0x2a69ac,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        
        // Create washer geometry and add to scene
        for (let i = 0; i < numWashers; i++) {
            const x = lowerBound + i * stepSize;
            const outerRadius = this.evaluateFunction(outerFuncStr, x);
            const innerRadius = this.evaluateFunction(innerFuncStr, x);
            
            // Safety checks
            if (isNaN(outerRadius) || !isFinite(outerRadius) || outerRadius < 0) continue;
            if (isNaN(innerRadius) || !isFinite(innerRadius) || innerRadius < 0) continue;
            
            try {
                // Create washer using RingGeometry for perfect flat disk with hole
                const ringGeometry = new THREE.RingGeometry(
                    innerRadius,  // inner radius
                    outerRadius,  // outer radius
                    32,           // segments
                    1,           // rings
                    0,           // start angle
                    Math.PI * 2  // end angle
                );
                
                const washer = new THREE.Mesh(ringGeometry, outerMaterial);
                
                // Position the washer based on axis of rotation
                if (axis === 'x-axis') {
                    washer.position.set(x, 0, 0);
                    washer.rotation.y = Math.PI / 2;
                } else {
                    washer.position.set(0, x, 0);
                    washer.rotation.x = Math.PI / 2;
                }
                
                this.solid.add(washer);
            } catch (error) {
                console.error('Error creating washer:', error);
            }
        }
        
        // Add the solid to the scene
        this.scene.add(this.solid);
        
        // Adjust camera position based on maximum radius
        const cameraDistance = Math.max(10, this.rotationAxis === 'x-axis' ? upperBound : 10);
        this.camera.position.set(cameraDistance, cameraDistance, cameraDistance);
        this.camera.lookAt(0, 0, 0);
        
        if (this.controls) {
            this.controls.update();
        }
    }
}

// Initialize 3D visualizations when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing 3D visualizations...');
    
    // Add a check for window load to ensure all resources are available
    if (document.readyState === 'complete') {
        initializeVisualizations();
    } else {
        window.addEventListener('load', initializeVisualizations);
    }
    
    function initializeVisualizations() {
        // Check if THREE.js is loaded
        if (typeof THREE === 'undefined') {
            console.error('THREE.js is not loaded. Please include it in your HTML file.');
            
            document.querySelectorAll('.model-container').forEach(container => {
                container.innerHTML = '<div class="error-message">THREE.js library could not be loaded.</div>';
            });
            return;
        }
        
        // First ensure OrbitControls is available
        if (typeof THREE.OrbitControls === 'undefined') {
            console.log('Loading OrbitControls from CDN...');
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js';
            document.head.appendChild(script);
            
            script.onload = function() {
                console.log('OrbitControls loaded successfully');
                initModels();
            };
            
            script.onerror = function() {
                console.error('Failed to load OrbitControls');
                initModels();
            };
        } else {
            initModels();
        }
    }
    function initModels() {
        // Initialize disk method visualizer
        let diskVisualizer;
        const diskContainer = document.getElementById('disk-method-3d');
        
        if (diskContainer) {
            console.log('Creating disk visualizer');
            try {
                diskVisualizer = new RevolutionVisualizer('disk-method-3d');
                diskVisualizer.createDiskModel('x^2', 0, 2, 'x-axis');
                
                window.updateDiskModel = (funcStr, lowerBound, upperBound, rotationAxis) => {
                    console.log('Updating disk model:', funcStr, lowerBound, upperBound, rotationAxis);
                    diskVisualizer.createDiskModel(funcStr, lowerBound, upperBound, rotationAxis);
                };
            } catch (error) {
                console.error('Error creating disk visualizer:', error);
                diskContainer.innerHTML = `<div class="error-message">Error: ${error.message}</div>`;
            }
        }
        
        // Initialize washer method visualizer
        let washerVisualizer;
        const washerContainer = document.getElementById('washer-method-3d');
        
        if (washerContainer) {
            console.log('Creating washer visualizer');
            try {
                washerVisualizer = new RevolutionVisualizer('washer-method-3d');
                washerVisualizer.createWasherModel('2+sin(x)', '1', 0, 2 * Math.PI, 'x-axis');
                
                window.updateWasherModel = (outerFunc, innerFunc, lowerBound, upperBound, rotationAxis) => {
                    console.log('Updating washer model:', outerFunc, innerFunc, lowerBound, upperBound, rotationAxis);
                    washerVisualizer.createWasherModel(outerFunc, innerFunc, lowerBound, upperBound, rotationAxis);
                };
            } catch (error) {
                console.error('Error creating washer visualizer:', error);
                washerContainer.innerHTML = `<div class="error-message">Error: ${error.message}</div>`;
            }
        }
        
        console.log('Visualization initialization complete');
    }
});