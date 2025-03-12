document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('section');
    
    function reinitializeWebGL(section) {
        const container = section.querySelector('.model-container, .intro-animation-container');
        if (!container) return;
        
        const containerId = container.id;
        if (!containerId) return;
        
        // Clear the container
        container.innerHTML = '';
        
        // Reinitialize based on container ID
        if (containerId === 'disk-method-3d') {
            const diskVisualizer = new RevolutionVisualizer('disk-method-3d');
            diskVisualizer.createDiskModel('x^2', 0, 2, 'x-axis');
        } else if (containerId === 'washer-method-3d') {
            const washerVisualizer = new RevolutionVisualizer('washer-method-3d');
            washerVisualizer.createWasherModel('2+sin(x)', '1', 0, 2 * Math.PI, 'x-axis');
        } else if (containerId === 'intro-animation') {
            initIntroAnimation();
        }
    }
    
    function switchToSection(targetSection) {
        const currentSection = document.querySelector('section.active');
        if (currentSection === targetSection) return;
        
        // Prepare target section for animation
        targetSection.style.display = 'block';
        targetSection.style.opacity = '0';
        targetSection.style.transform = 'translateY(20px)';
        
        // Force a reflow
        targetSection.offsetHeight;
        
        // Animate out current section if it exists
        if (currentSection) {
            currentSection.style.transform = 'translateY(-20px)';
            currentSection.style.opacity = '0';
            
            // After animation, hide the section
            setTimeout(() => {
                currentSection.style.display = 'none';
                currentSection.classList.remove('active');
            }, 500);
        }
        
        // Animate in new section without scrolling
        setTimeout(() => {
            targetSection.classList.add('active');
            targetSection.style.transform = 'translateY(0)';
            targetSection.style.opacity = '1';
            
            // Reinitialize WebGL context for the new section
            reinitializeWebGL(targetSection);
        }, currentSection ? 50 : 0);
    }
    
    // Add click event for each navigation link
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            // Update navigation state
            navLinks.forEach(link => {
                link.style.transition = 'opacity 0.3s ease';
                link.style.opacity = '0.5';
                link.classList.remove('active');
            });
            
            this.style.opacity = '1';
            this.classList.add('active');
            
            // Switch to target section
            switchToSection(targetSection);
        });
    });
    
    // Initialize active section
    const activeSection = document.querySelector('section.active');
    if (activeSection) {
        activeSection.style.opacity = '0';
        activeSection.style.transform = 'translateY(20px)';
        activeSection.style.display = 'block';
        
        // Force a reflow
        activeSection.offsetHeight;
        
        // Animate in
        activeSection.style.opacity = '1';
        activeSection.style.transform = 'translateY(0)';
        
        // Initialize WebGL for the active section
        reinitializeWebGL(activeSection);
    }
    
    // Handle calculator method selection
    const methodSelect = document.getElementById('calc-method');
    const diskInputs = document.getElementById('disk-inputs');
    const washerInputs = document.getElementById('washer-inputs');
    
    if (methodSelect) {
        methodSelect.addEventListener('change', function() {
            const showDisk = this.value === 'disk';
            
            diskInputs.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            washerInputs.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            
            if (showDisk) {
                washerInputs.style.opacity = '0';
                washerInputs.style.transform = 'translateY(-10px)';
                setTimeout(() => {
                    washerInputs.style.display = 'none';
                    diskInputs.style.display = 'block';
                    diskInputs.style.opacity = '0';
                    diskInputs.style.transform = 'translateY(10px)';
                    diskInputs.offsetHeight;
                    diskInputs.style.opacity = '1';
                    diskInputs.style.transform = 'translateY(0)';
                }, 300);
            } else {
                diskInputs.style.opacity = '0';
                diskInputs.style.transform = 'translateY(-10px)';
                setTimeout(() => {
                    diskInputs.style.display = 'none';
                    washerInputs.style.display = 'block';
                    washerInputs.style.opacity = '0';
                    washerInputs.style.transform = 'translateY(10px)';
                    washerInputs.offsetHeight;
                    washerInputs.style.opacity = '1';
                    washerInputs.style.transform = 'translateY(0)';
                }, 300);
            }
        });
    }
});