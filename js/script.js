// Search Functionality
document.addEventListener('DOMContentLoaded', function()
{
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const closeSidebar = document.getElementById('close-sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (menuToggle && sidebar)
    {
        menuToggle.addEventListener('click', () =>
        {
            sidebar.classList.add('active');
            overlay.classList.add('active');
        });
    }

    if (closeSidebar)
    {
        closeSidebar.addEventListener('click', () =>
        {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    }
    
    // Close when clicking on overlay
    if (overlay)
    {
        overlay.addEventListener('click', () =>
        {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    }

    // Close sidebar when resizing back to desktop
    window.addEventListener('resize', () =>
    {
        if (window.innerWidth > 768)
        {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        }
    });
    
    // Back to Top Button
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn)
    {
        window.addEventListener('scroll', function()
        {
            if (window.pageYOffset > 300)
            {
                backToTopBtn.style.display = 'block';
            }
            else
            {
                backToTopBtn.style.display = 'none';
            }
        });
        
        backToTopBtn.addEventListener('click', function()
        {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});

