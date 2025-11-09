// Search Functionality
document.addEventListener('DOMContentLoaded', function()
{
    // Image slider function
    const slides = document.querySelectorAll('.hero-slider .slide');
    let current = 0;

    function nextSlide()
    {
        slides[current].classList.remove('active');
        current = (current + 1) % slides.length;
        slides[current].classList.add('active');
    }

    setInterval(nextSlide, 4000); // changes every 4 seconds
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    //SIDE BAR WHEN DISPLAY SIZE REDUCES
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
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    // Dynamic content for Offers Banner and Popular This Week
    // Dummy data for now (later replaced with Firebase)
    const offerData = {
        enabled: true,
        title: "🎉 Diwali Special Offers!",
        description: "Get up to 20% OFF on premium halwa gift boxes. Limited-time festive offer!",
        buttonText: "Shop Now",
        buttonLink: "products.html"
    };

    const popularItems = [
        {
            name: "Tirunelveli Halwa",
            desc: "Our most loved classic halwa of the week.",
            image: "images/tirunelveli-halwa.png"
        },
        {
            name: "Milk Halwa",
            desc: "Soft, creamy and absolutely irresistible.",
            image: "images/milk-halwa.jpg"
        },
        {
            name: "Cashew Halwa",
            desc: "Rich and nutty halwa made with premium cashews.",
            image: "images/cashew-halwa.png"
        }
    ];

    // Render Offer Banner
    function renderOfferBanner() {
        const banner = document.getElementById("offerBanner");

        if (!offerData.enabled) {
            banner.style.display = "none";
            return;
        }

        banner.innerHTML = `
            <div class="container">
                <h2>${offerData.title}</h2>
                <p>${offerData.description}</p>
                <a href="${offerData.buttonLink}" class="btn">${offerData.buttonText}</a>
            </div>
        `;
    }

    // Render Popular This Week
    function renderPopularWeek() {
        const container = document.getElementById("popularWeekContainer");
        container.innerHTML = "";

        popularItems.forEach(item => {
            container.innerHTML += `
                <div class="popular-item">
                    <img src="${item.image}" alt="${item.name}">
                    <h3>${item.name}</h3>
                    <p>${item.desc}</p>
                </div>
            `;
        });
    }

    renderOfferBanner();
    renderPopularWeek();
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------

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
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------

});

