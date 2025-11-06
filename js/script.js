// Search Functionality
document.addEventListener('DOMContentLoaded', function()
{
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.querySelector('.search-btn');
    
    if (searchInput && searchBtn)
    {
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') performSearch();
        });
    }
    
    function performSearch()
    {
        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm) {
            alert(`Searching for: ${searchTerm}`);
            // Implement actual search logic here
        }
    }
    
    // Back to Top Button
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopBtn.style.display = 'block';
            } else {
                backToTopBtn.style.display = 'none';
            }
        });
        
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});

