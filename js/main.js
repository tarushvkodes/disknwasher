// Main JavaScript file to initialize all components
document.addEventListener('DOMContentLoaded', function() {
    // Create loading indicator and hide it when everything is loaded
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.innerHTML = '<div class="spinner"></div><p>Loading visualizations...</p>';
    document.body.appendChild(loadingIndicator);

    // Wait for all required libraries before initialization
    window.addEventListener('load', function() {
        console.log('Window fully loaded, checking dependencies');

        // Create a promise that resolves when MathJax is ready
        const mathJaxReady = new Promise((resolve) => {
            if (window.MathJax && window.MathJax.typesetPromise) {
                resolve();
            } else {
                // If MathJax isn't loaded yet, wait for it
                window.MathJax = {
                    ...window.MathJax,
                    startup: {
                        ...window.MathJax?.startup,
                        ready: () => {
                            resolve();
                        }
                    }
                };
            }
        });

        // Create a promise that resolves when THREE.js is ready
        const threeJsReady = new Promise((resolve) => {
            if (typeof THREE !== 'undefined') {
                resolve();
            } else {
                let attempts = 0;
                // Check every 100ms for THREE.js
                const checkInterval = setInterval(() => {
                    attempts++;
                    if (typeof THREE !== 'undefined') {
                        clearInterval(checkInterval);
                        resolve();
                    }
                    // After 20 attempts (2 seconds), try to reload the script
                    if (attempts === 20) {
                        const script = document.createElement('script');
                        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
                        document.head.appendChild(script);
                    }
                    // Timeout after 5 seconds total
                    if (attempts >= 50) {
                        clearInterval(checkInterval);
                        console.error('THREE.js failed to load');
                        resolve(); // Resolve anyway to not block other functionality
                    }
                }, 100);
            }
        });

        // Initialize everything once dependencies are loaded
        Promise.all([mathJaxReady, threeJsReady]).then(() => {
            console.log('All dependencies loaded, initializing application');

            // Initialize all sections first but keep them hidden
            document.querySelectorAll('section').forEach(section => {
                section.style.visibility = 'hidden';
                section.style.display = 'block';
            });

            // Initialize components
            initComponents();

            // Show the active section
            document.querySelectorAll('section').forEach(section => {
                if (section.classList.contains('active')) {
                    section.style.visibility = 'visible';
                } else {
                    section.style.display = 'none';
                    section.style.visibility = 'visible';
                }
            });

            // Remove loading indicator
            loadingIndicator.style.display = 'none';
        }).catch(error => {
            console.error('Error during initialization:', error);
            loadingIndicator.style.display = 'none';
        });
    });
    
    function initComponents() {
        // Initialize the intro animation
        initIntroAnimation();
        
        // Force initialize all 3D models
        initializeAllModels();
        
        // Check for WebGL support
        if (!isWebGLAvailable()) {
            showWebGLError();
        }
    }
    
    // Function to initialize all 3D models
    function initializeAllModels() {
        // Force initialize disk method model
        const diskContainer = document.getElementById('disk-method-3d');
        if (diskContainer && !diskContainer.querySelector('canvas')) {
            console.log('Directly initializing disk method visualizer');
            try {
                const diskVisualizer = new RevolutionVisualizer('disk-method-3d');
                diskVisualizer.createDiskModel('x^2', 0, 2, 'x-axis');
                window.updateDiskModel = (funcStr, lowerBound, upperBound, rotationAxis) => {
                    diskVisualizer.createDiskModel(funcStr, lowerBound, upperBound, rotationAxis);
                };
            } catch (error) {
                console.error('Error forcing disk visualizer initialization:', error);
            }
        }
        
        // Force initialize washer method model
        const washerContainer = document.getElementById('washer-method-3d');
        if (washerContainer && !washerContainer.querySelector('canvas')) {
            console.log('Directly initializing washer method visualizer');
            try {
                const washerVisualizer = new RevolutionVisualizer('washer-method-3d');
                washerVisualizer.createWasherModel('2+sin(x)', '1', 0, 2 * Math.PI, 'x-axis');
                window.updateWasherModel = (outerFunc, innerFunc, lowerBound, upperBound, rotationAxis) => {
                    washerVisualizer.createWasherModel(outerFunc, innerFunc, lowerBound, upperBound, rotationAxis);
                };
            } catch (error) {
                console.error('Error forcing washer visualizer initialization:', error);
            }
        }
        
        // Trigger resize event to ensure proper rendering
        window.dispatchEvent(new Event('resize'));
    }
    
    function showWebGLError() {
        const webglError = document.createElement('div');
        webglError.className = 'webgl-error';
        webglError.innerHTML = `
            <div class="error-container">
                <h3>WebGL Not Available</h3>
                <p>Your browser or device doesn't support WebGL, which is required for 3D visualizations.</p>
                <p>Try using a modern browser like Chrome, Firefox, or Edge.</p>
            </div>
        `;
        
        document.querySelectorAll('.model-container, .intro-animation-container').forEach(container => {
            container.innerHTML = '';
            container.appendChild(webglError.cloneNode(true));
        });
    }
    
    // Function to check WebGL availability
    function isWebGLAvailable() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext &&
                (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }

    // Function to initialize the introductory animation
    function initIntroAnimation() {
        const introContainer = document.getElementById('intro-animation');
        if (!introContainer) {
            console.warn('Intro animation container not found');
            return;
        }

        console.log('Initializing intro animation');
        
        try {
            // Create a scene for the animation
            const scene = new THREE.Scene();
            scene.background = new THREE.Color(0xffffff);
    
            // Create camera with adjusted initial position
            const camera = new THREE.PerspectiveCamera(
                60, // Wider field of view
                introContainer.clientWidth / introContainer.clientHeight,
                0.1,
                1000
            );
            camera.position.set(3, 4, 5); // Adjusted for better view of disks touching curve
            camera.lookAt(0, 1, 0); // Look at center of curve height
    
            // Create renderer with explicit settings for better compatibility
            const renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true,
                precision: 'highp',
                powerPreference: 'high-performance'
            });
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(introContainer.clientWidth, introContainer.clientHeight);
            introContainer.innerHTML = ''; // Clear any existing content
            introContainer.appendChild(renderer.domElement);
    
            // Add lights
            const ambientLight = new THREE.AmbientLight(0x606060);
            scene.add(ambientLight);
            
            const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight1.position.set(1, 1, 1);
            scene.add(directionalLight1);
            
            const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
            directionalLight2.position.set(-1, -1, -1);
            scene.add(directionalLight2);
            
            // Add point light for better visibility
            const pointLight = new THREE.PointLight(0xffffff, 1, 100);
            pointLight.position.set(0, 5, 5);
            scene.add(pointLight);
    
            // Create a unified main group that will contain everything
            // This ensures synchronized rotation
            const mainGroup = new THREE.Group();
            scene.add(mainGroup);
            
            // Create disk visualization
            const disks = [];
            const diskMaterial = new THREE.MeshPhongMaterial({
                color: 0x7fb3d5,
                transparent: true,
                opacity: 0.7,
                side: THREE.DoubleSide
            });

            // Create disk visualization
            for (let i = 0; i < 20; i++) {
                const x = -Math.PI + i * (2 * Math.PI / 19);
                const y = Math.sin(x) + 1; // Function value = radius

                // Create flat disk with correct radius
                const diskGeometry = new THREE.CylinderGeometry(
                    y,    // top radius = function value
                    y,    // bottom radius = function value
                    0.05, // very thin height for flat disk
                    32,   // segments
                    1,
                    false
                );

                const disk = new THREE.Mesh(diskGeometry, diskMaterial);

                // Position disk with center at x-axis
                disk.position.set(x, 0, 0);

                // Rotate disk to be perpendicular to x-axis
                disk.rotation.z = Math.PI / 2;

                disk.visible = false;
                diskGroup.add(disk);
                disks.push(disk);
            }

            // Create solid of revolution with same orientation
            const profilePoints = [];
            for (let i = 0; i < numPoints; i++) {
                const x = -Math.PI + i * step;
                const y = Math.sin(x) + 1;
                profilePoints.push(new THREE.Vector2(y, x)); // Swap to get correct orientation
            }

            const solidGeometry = new THREE.LatheGeometry(profilePoints, 32);
            const solidMaterial = new THREE.MeshPhongMaterial({
                color: 0x7fb3d5,
                transparent: true,
                opacity: 0.5,
                side: THREE.DoubleSide
            });

            const solid = new THREE.Mesh(solidGeometry, solidMaterial);
            
            // Orient solid to match disks
            solid.rotation.x = Math.PI / 2;
            solid.visible = false;
            
            mainGroup.add(solid);
    
            // Create animation states
            let animationState = 0;
            const states = {
                SHOW_CURVE: 0,
                SHOW_DISKS: 1,
                ROTATE_GROUP: 2,
                SHOW_SOLID: 3
            };
    
            let rotationAngle = 0;
            let diskIndex = 0;
            let showNextDiskTime = 0;
    
            // Add orbit controls for user interaction
            let controls;
            if (typeof THREE.OrbitControls !== 'undefined') {
                controls = new THREE.OrbitControls(camera, renderer.domElement);
                controls.enableDamping = true;
                controls.dampingFactor = 0.05;
                controls.rotateSpeed = 0.5;
                controls.enablePan = false;
                
                // Disable OrbitControls during animation
                controls.enabled = false;
            }
    
            // Animation loop
            function animate(time) {
                requestAnimationFrame(animate);
                
                time *= 0.001; // Convert to seconds
                
                // Update controls if available and enabled
                if (controls && controls.enabled) {
                    controls.update();
                }
                
                // State machine for animation
                switch (animationState) {
                    case states.SHOW_CURVE:
                        if (time > 1) {
                            animationState = states.SHOW_DISKS;
                            showNextDiskTime = time;
                        }
                        break;
                        
                    case states.SHOW_DISKS:
                        // Show disks one by one
                        if (time > showNextDiskTime && diskIndex < disks.length) {
                            disks[diskIndex].visible = true;
                            diskIndex++;
                            showNextDiskTime = time + 0.1; // Show next disk after 100ms
                        }
                        
                        if (diskIndex >= disks.length && time > showNextDiskTime + 1) {
                            animationState = states.ROTATE_GROUP;
                        }
                        break;
                        
                    case states.ROTATE_GROUP:
                        // Rotate the entire group (which includes grid, axes, disks)
                        rotationAngle += 0.01;
                        
                        // Apply rotation to the entire group
                        mainGroup.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotationAngle);
                        
                        if (rotationAngle > Math.PI * 2) {
                            animationState = states.SHOW_SOLID;
                            
                            // Reset rotation to starting position
                            mainGroup.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0);
                            
                            // Hide the disks
                            diskGroup.visible = false;
                            
                            // Show and rotate the solid to match the disk orientation
                            solid.visible = true;
                            solid.rotation.z = Math.PI / 2;
                            
                            // Enable OrbitControls after animation completes
                            if (controls) {
                                controls.enabled = true;
                            }
                        }
                        break;
                        
                    case states.SHOW_SOLID:
                        // No automatic rotation when controls are enabled
                        if (controls && !controls.enabled) {
                            mainGroup.rotation.y += 0.005;
                        }
                        break;
                }
                
                renderer.render(scene, camera);
            }
            
            // Add a double click handler to reset the view
            introContainer.addEventListener('dblclick', function() {
                camera.position.set(3, 3, 5);
                camera.lookAt(0, 0, 0);
                if (controls) {
                    controls.reset();
                }
            });
            
            // Start the animation
            animate(0);
            
            // Handle window resize
            window.addEventListener('resize', () => {
                camera.aspect = introContainer.clientWidth / introContainer.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(introContainer.clientWidth, introContainer.clientHeight);
            });
            
            console.log('Intro animation initialized successfully');
        } catch (error) {
            console.error('Error initializing intro animation:', error);
            introContainer.innerHTML = `<div class="error-message">Error initializing 3D animation: ${error.message}</div>`;
        }
    }
});