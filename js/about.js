// about.js - Functional version (FAQ + scroll animation)

document.addEventListener('DOMContentLoaded', () => {
    initializeFAQ();
    animateOnScroll();
});

function initializeFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const toggleIcon = item.querySelector('.toggle-icon');

        // Hide all answers initially
        answer.style.display = 'none';

        question.addEventListener('click', () => {
            const isOpen = answer.style.display === 'block';

            // Close all other FAQs
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.querySelector('.faq-answer').style.display = 'none';
                    otherItem.querySelector('.toggle-icon').textContent = '+';
                    otherItem.classList.remove('active');
                }
            });

            // Toggle current one
            if (isOpen) {
                answer.style.display = 'none';
                toggleIcon.textContent = '+';
                item.classList.remove('active');
            } else {
                answer.style.display = 'block';
                toggleIcon.textContent = '−';
                item.classList.add('active');

                // Smooth scroll to make answer visible
                setTimeout(() => {
                    item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 100);
            }
        });
    });

    // Open the first FAQ by default
    if (faqItems.length > 0) {
        const firstItem = faqItems[0];
        firstItem.querySelector('.faq-answer').style.display = 'block';
        firstItem.querySelector('.toggle-icon').textContent = '−';
        firstItem.classList.add('active');
    }
}

function animateOnScroll() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.about-text, .about-image, .faq-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}
