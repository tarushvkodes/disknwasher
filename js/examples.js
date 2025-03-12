// Examples functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize solution buttons
    const solutionButtons = document.querySelectorAll('.show-solution-btn');
    
    solutionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const solutionDiv = this.previousElementSibling;
            
            if (solutionDiv.style.display === 'block') {
                solutionDiv.style.display = 'none';
                this.textContent = 'Show Solution';
            } else {
                solutionDiv.style.display = 'block';
                this.textContent = 'Hide Solution';
            }
        });
    });
    
    // Initialize 3D models for examples if needed
    // This could be extended to create 3D models for each example
});