// Main JavaScript file to initialize all components
document.addEventListener('DOMContentLoaded', function() {
    // Create loading indicator and hide it when everything is loaded
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.innerHTML = '<div class="spinner"></div><p>Loading visualizations...</p>';
    document.body.appendChild(loadingIndicator);

    // Initialize intro animation first
    initIntroAnimation();

    // Wait for all required libraries before initialization
    window.addEventListener('load', function() {
        console.log('Window fully loaded, checking dependencies');

        // Create a promise that resolves when MathJax is ready
        const mathJaxReady = new Promise((resolve) => {
            if (window.MathJax && window.MathJax.typesetPromise) {
                resolve();
            } else {
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
                const checkInterval = setInterval(() => {
                    attempts++;
                    if (typeof THREE !== 'undefined') {
                        clearInterval(checkInterval);
                        resolve();
                    }
                    if (attempts === 20) {
                        const script = document.createElement('script');
                        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
                        document.head.appendChild(script);
                    }
                    if (attempts >= 50) {
                        clearInterval(checkInterval);
                        console.error('THREE.js failed to load');
                        resolve();
                    }
                }, 100);
            }
        });

        // Initialize everything once dependencies are loaded
        Promise.all([mathJaxReady, threeJsReady]).then(() => {
            console.log('All dependencies loaded, initializing application');
            initComponents();
            loadingIndicator.style.display = 'none';
        }).catch(error => {
            console.error('Error during initialization:', error);
            loadingIndicator.style.display = 'none';
        });
    });
});

// Function to initialize the introductory animation
function initIntroAnimation() {
    const introContainer = document.getElementById('intro-animation');
    if (!introContainer) return;

    try {
        // Create scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);

        // Create camera with better viewing angle
        const camera = new THREE.PerspectiveCamera(
            60,
            introContainer.clientWidth / introContainer.clientHeight,
            0.1,
            1000
        );
        camera.position.set(4, 2, 4);
        camera.lookAt(0, 0, 0);

        // Create renderer
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(introContainer.clientWidth, introContainer.clientHeight);
        introContainer.innerHTML = '';
        introContainer.appendChild(renderer.domElement);

        // Add lights
        const ambientLight = new THREE.AmbientLight(0x606060);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);

        // Create a more representative solid of revolution using a parabola
        const points = [];
        const numPoints = 50;
        for (let i = 0; i < numPoints; i++) {
            const t = i / (numPoints - 1);
            const x = t * 2; // Scale x from 0 to 2
            const y = 0.5 * x * x; // Parabola: y = 0.5x²
            points.push(new THREE.Vector2(y, x)); // Swap x,y for proper orientation
        }

        const geometry = new THREE.LatheGeometry(points, 32);
        
        const material = new THREE.MeshPhongMaterial({
            color: 0x2997ff,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide,
            shininess: 50
        });

        const solid = new THREE.Mesh(geometry, material);
        solid.rotation.x = Math.PI / 2; // Rotate to align with typical math orientation
        scene.add(solid);

        // Add grid for reference
        const gridHelper = new THREE.GridHelper(4, 10, 0x888888, 0xcccccc);
        gridHelper.rotation.x = Math.PI / 2;
        scene.add(gridHelper);

        // Add OrbitControls
        let controls;
        if (typeof THREE.OrbitControls !== 'undefined') {
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.enableZoom = true;
            controls.minDistance = 3;
            controls.maxDistance = 10;
        }

        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            if (controls) controls.update();
            solid.rotation.y += 0.005;
            renderer.render(scene, camera);
        }

        animate();

        // Handle window resize
        window.addEventListener('resize', () => {
            if (introContainer.clientWidth && introContainer.clientHeight) {
                camera.aspect = introContainer.clientWidth / introContainer.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(introContainer.clientWidth, introContainer.clientHeight);
            }
        });

    } catch (error) {
        console.error('Error initializing intro animation:', error);
        introContainer.innerHTML = `<div class="error-message">Error initializing 3D animation: ${error.message}</div>`;
    }
}

function initComponents() {
    // Initialize all 3D models
    initializeAllModels();
    
    // Check for WebGL support
    if (!isWebGLAvailable()) {
        showWebGLError();
    }
}