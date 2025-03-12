// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get all navigation links
    const navLinks = document.querySelectorAll('nav a');
    
    // Get all sections
    const sections = document.querySelectorAll('section');
    
    // Helper function to trigger resize events for WebGL canvases
    function triggerResizeForCanvases(section) {
        const canvases = section.querySelectorAll('canvas');
        if (canvases.length > 0) {
            window.dispatchEvent(new Event('resize'));
        }
    }
    
    // Helper function to switch sections
    function switchToSection(targetSection) {
        // First show the target section before hiding others
        // This ensures proper WebGL initialization
        targetSection.style.display = 'block';
        targetSection.classList.add('active');
        
        // Now hide other sections
        sections.forEach(section => {
            if (section !== targetSection) {
                section.classList.remove('active');
                section.style.display = 'none';
            }
        });
        
        // Trigger resize event for the newly visible section
        setTimeout(() => {
            triggerResizeForCanvases(targetSection);
        }, 0);
    }
    
    // Add click event for each navigation link
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get the target section from the href attribute
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            // Remove active class from all links
            navLinks.forEach(link => link.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Switch to target section
            switchToSection(targetSection);
            
            // Scroll to the top of the section
            window.scrollTo({
                top: targetSection.offsetTop - 80,
                behavior: 'smooth'
            });
        });
    });
    
    // Initialize the active section
    const activeSection = document.querySelector('section.active');
    if (activeSection) {
        switchToSection(activeSection);
    }
    
    // Handle solution buttons in the examples section
    const solutionButtons = document.querySelectorAll('.show-solution-btn');
    
    solutionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const solutionElement = this.parentNode.querySelector('.solution');
            
            if (solutionElement.style.display === 'block') {
                solutionElement.style.display = 'none';
                this.textContent = 'Show Solution';
            } else {
                solutionElement.style.display = 'block';
                this.textContent = 'Hide Solution';
                // Trigger resize in case there are any visualizations
                triggerResizeForCanvases(solutionElement);
            }
        });
    });
    
    // Handle calculator method selection
    const methodSelect = document.getElementById('calc-method');
    const diskInputs = document.getElementById('disk-inputs');
    const washerInputs = document.getElementById('washer-inputs');
    
    if (methodSelect) {
        methodSelect.addEventListener('change', function() {
            if (this.value === 'disk') {
                diskInputs.style.display = 'block';
                washerInputs.style.display = 'none';
            } else {
                diskInputs.style.display = 'none';
                washerInputs.style.display = 'block';
            }
        });
    }
});