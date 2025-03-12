// Main JavaScript file to initialize all components
document.addEventListener('DOMContentLoaded', function() {
    // Check if MathJax is loaded and render all math elements
    if (window.MathJax) {
        MathJax.typeset();
    }
    
    // Initialize the intro animation
    initIntroAnimation();
    
    // Create loading indicator and hide it when everything is loaded
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.innerHTML = '<div class="spinner"></div><p>Loading visualizations...</p>';
    document.body.appendChild(loadingIndicator);
    
    // Hide loading indicator when window is fully loaded
    window.addEventListener('load', function() {
        loadingIndicator.style.display = 'none';
    });
    
    // Check for WebGL support
    if (!isWebGLAvailable()) {
        const webglError = document.createElement('div');
        webglError.className = 'webgl-error';
        webglError.innerHTML = `
            <div class="error-container">
                <h3>WebGL Not Available</h3>
                <p>Your browser or device doesn't support WebGL, which is required for 3D visualizations.</p>
                <p>Try using a modern browser like Chrome, Firefox, or Edge.</p>
            </div>
        `;
        
        const modelContainers = document.querySelectorAll('.model-container');
        modelContainers.forEach(container => {
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
        if (!introContainer) return;

        // Create a scene for the animation
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);

        // Create camera
        const camera = new THREE.PerspectiveCamera(
            75,
            introContainer.clientWidth / introContainer.clientHeight,
            0.1,
            1000
        );
        camera.position.set(3, 3, 5);
        camera.lookAt(0, 0, 0);

        // Create renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(introContainer.clientWidth, introContainer.clientHeight);
        introContainer.appendChild(renderer.domElement);

        // Add lights
        const ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);

        // Create a function curve
        const curve = new THREE.CurvePath();
        const points = [];
        
        // Sample function: y = sin(x) + 1 from -π to π
        const numPoints = 100;
        const step = 2 * Math.PI / (numPoints - 1);
        
        for (let i = 0; i < numPoints; i++) {
            const x = -Math.PI + i * step;
            const y = Math.sin(x) + 1;
            points.push(new THREE.Vector3(x, y, 0));
        }
        
        // Create a curve from the points
        const curveGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const curveMaterial = new THREE.LineBasicMaterial({ 
            color: 0x2a69ac,
            linewidth: 3
        });
        const curveLine = new THREE.Line(curveGeometry, curveMaterial);
        scene.add(curveLine);

        // Add x and y axes
        const axesHelper = new THREE.AxesHelper(4);
        scene.add(axesHelper);

        // Add a grid
        const gridHelper = new THREE.GridHelper(8, 8);
        gridHelper.rotation.x = Math.PI / 2;
        scene.add(gridHelper);

        // Create an array to store the disks
        const disks = [];
        const diskMaterial = new THREE.MeshPhongMaterial({
            color: 0x7fb3d5,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });

        // Create the initial disks (will be hidden at first)
        for (let i = 0; i < 20; i++) {
            const x = -Math.PI + i * (2 * Math.PI / 19);
            const y = Math.sin(x) + 1;
            
            const diskGeometry = new THREE.CylinderGeometry(
                y,
                y,
                0.2,
                32,
                1,
                false
            );
            
            const disk = new THREE.Mesh(diskGeometry, diskMaterial);
            disk.position.set(x, 0, 0);
            disk.rotation.z = Math.PI / 2;
            disk.visible = false;
            scene.add(disk);
            disks.push(disk);
        }

        // Create a solid of revolution (initially hidden)
        const solidGeometry = new THREE.LatheGeometry(
            points.map(p => new THREE.Vector2(p.y, p.x + Math.PI)),
            32
        );
        const solidMaterial = new THREE.MeshPhongMaterial({
            color: 0x7fb3d5,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide
        });
        const solid = new THREE.Mesh(solidGeometry, solidMaterial);
        solid.rotation.x = Math.PI / 2;
        solid.visible = false;
        scene.add(solid);

        // Create animation states
        let animationState = 0;
        const states = {
            SHOW_CURVE: 0,
            SHOW_DISKS: 1,
            ROTATE_DISKS: 2,
            SHOW_SOLID: 3
        };

        let rotationAngle = 0;
        let diskIndex = 0;
        let showNextDiskTime = 0;
        let transitionTime = 0;

        // Add orbit controls for user interaction
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.rotateSpeed = 0.5;
        controls.enablePan = false;

        // Animation loop
        function animate(time) {
            requestAnimationFrame(animate);
            
            time *= 0.001; // Convert to seconds
            controls.update();
            
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
                        animationState = states.ROTATE_DISKS;
                        transitionTime = time;
                    }
                    break;
                    
                case states.ROTATE_DISKS:
                    // Rotate the disks around the axis
                    rotationAngle += 0.01;
                    
                    disks.forEach(disk => {
                        const x = disk.position.x;
                        const radius = disk.geometry.parameters.radiusTop;
                        
                        disk.position.z = Math.sin(rotationAngle) * radius;
                        disk.position.y = Math.cos(rotationAngle) * radius;
                        disk.rotation.x = rotationAngle;
                    });
                    
                    if (rotationAngle > Math.PI * 2) {
                        animationState = states.SHOW_SOLID;
                        transitionTime = time;
                        
                        // Hide the disks
                        disks.forEach(disk => disk.visible = false);
                        
                        // Show the solid
                        solid.visible = true;
                    }
                    break;
                    
                case states.SHOW_SOLID:
                    // Keep rotating the solid slightly
                    solid.rotation.z += 0.005;
                    break;
            }
            
            renderer.render(scene, camera);
        }
        
        // Start the animation
        animate(0);
        
        // Handle window resize
        window.addEventListener('resize', () => {
            camera.aspect = introContainer.clientWidth / introContainer.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(introContainer.clientWidth, introContainer.clientHeight);
        });
    }
});