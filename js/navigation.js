// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get all navigation links
    const navLinks = document.querySelectorAll('nav a');
    
    // Get all sections
    const sections = document.querySelectorAll('section');
    
    // Add click event for each navigation link
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get the target section from the href attribute
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            // Remove active class from all links and sections
            navLinks.forEach(link => link.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            
            // Add active class to the clicked link and target section
            this.classList.add('active');
            targetSection.classList.add('active');
            
            // Scroll to the top of the section
            window.scrollTo({
                top: targetSection.offsetTop - 80,
                behavior: 'smooth'
            });
        });
    });
    
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