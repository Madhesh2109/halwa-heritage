// script.js (Firebase-integrated + auto-hide empty sections)
import { db } from "../firebase/firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async function () 
{
    // ==========================================
    // HERO IMAGE SLIDER
    // ==========================================
    const slides = document.querySelectorAll('.hero-slider .slide');
    let current = 0;

    // Only initialize slider if slides exist
    if (slides.length > 0) 
    {
        function nextSlide()
        {
            // Add null check before accessing slides
            if (slides[current])
            {
                slides[current].classList.remove('active');
            }
            current = (current + 1) % slides.length;
            if (slides[current])
            {
                slides[current].classList.add('active');
            }
        }
        // Start interval only if we have slides
        setInterval(nextSlide, 4000);
    }
    else
    {
        console.log("No hero slides found - slider disabled");
    }

    // ==========================================
    // SIDEBAR HANDLING
    // ==========================================
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
    closeSidebar?.addEventListener('click', () => 
    {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    });
    overlay?.addEventListener('click', () => 
    {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    });
    window.addEventListener('resize', () =>
    {
        if (window.innerWidth > 768) 
        {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        }
    });

    // ==========================================
    // FETCH OFFERS FROM FIRESTORE
    // ==========================================
    async function fetchOffers()
    {
        try
        {
            const querySnapshot = await getDocs(collection(db, "offers"));
            if (querySnapshot.empty) return null;

            const offers = querySnapshot.docs.map(doc => doc.data());
            return offers.find(o => o.enabled === true) || offers[0];
        }
        catch (err)
        {
            console.error("Error fetching offers:", err);
            return null;
        }
    }

    async function renderOfferBanner() 
    {
        // Checking for banner
        const banner = document.getElementById("offerBanner");
        if (!banner)
        {
            console.log("Offer banner element is not found on this page.");
            return;
        }

        // Fetching offers
        const offerData = await fetchOffers();

        if (!offerData) 
        {
            banner.style.display = "none";
            return;
        }
        
        banner.innerHTML = `
        <div class="container">
            <h2>${offerData.title || "Special Offers!"}</h2>
            <p>${offerData.description || ""}</p>
            ${offerData.buttonLink ? `<a href="${offerData.buttonLink}" class="btn">${offerData.buttonText || "Shop Now"}</a>` : ""}
        </div>
        `;
        banner.style.display = "block";
    }

    // ==========================================
    // FETCH POPULAR ITEMS FROM FIRESTORE
    // ==========================================
    async function fetchPopularItems() 
    {
        try 
        {
            const querySnapshot = await getDocs(collection(db, "popular_week"));
            return querySnapshot.docs.map(doc => doc.data());
        } 
        catch (err) 
        {
            console.error("Error fetching popular items:", err);
            return [];
        }
    }

    async function renderPopularWeek() 
    {
        const section = document.querySelector(".popular-week");
        const container = document.getElementById("popularWeekContainer");
        const items = await fetchPopularItems();

        if (!items.length) 
        {
            section.style.display = "none";
            return;
        }

        container.innerHTML = items.map(item => `
            <div class="popular-item">
                <img src="${item.image || 'images/default.jpg'}" alt="${item.name || 'Halwa'}">
                <h3>${item.name || 'Unnamed Halwa'}</h3>
                <p>${item.desc || ''}</p>
            </div>
        `).join('');
        section.style.display = "block";
    }

    // ==========================================
    // INITIALIZE DYNAMIC CONTENT
    // ==========================================
    await renderOfferBanner();
    await renderPopularWeek();

    // ==========================================
    // BACK TO TOP BUTTON
    // ==========================================
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) 
    {
        window.addEventListener('scroll', function () 
        {
            backToTopBtn.style.display = window.pageYOffset > 300 ? 'block' : 'none';
        });
        backToTopBtn.addEventListener('click', function () 
        {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});
