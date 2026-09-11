//copyright by https://wbbhumiprint.com
//owner by Mr.gani 
//

// Enhanced Slider functionality
document.addEventListener('DOMContentLoaded', function() {
    try {
        const slides = document.querySelectorAll('.slide');
        const dots = document.querySelectorAll('.progress-dot');
        let currentSlide = 0;
        const totalSlides = slides.length;
        
        if (totalSlides === 0) {
            console.warn('No slides found for slider');
            return;
        }

    function updateDots(index) {
        dots.forEach(dot => dot.classList.remove('active'));
        dots[index].classList.add('active');
    }

    function showSlide(index) {
        // Hide all slides
        slides.forEach(slide => {
            slide.classList.remove('active');
            slide.querySelector('.slide-content').style.opacity = '0';
            slide.querySelector('.slide-content').style.transform = 'translateX(30px)';
        });

        // Show current slide
        slides[index].classList.add('active');
        
        // Trigger the transition after a small delay
        setTimeout(() => {
            slides[index].querySelector('.slide-content').style.opacity = '1';
            slides[index].querySelector('.slide-content').style.transform = 'translateX(0)';
        }, 50);

        // Update dots
        updateDots(index);
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        showSlide(currentSlide);
    }

    // Initialize first slide
    showSlide(0);

    // Auto-advance slides every 3 seconds
    setInterval(nextSlide, 3000);

    // Add touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    const slider = document.querySelector('.slider-container');
    
    slider.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, false);
    
    slider.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);

    function handleSwipe() {
        const swipeThreshold = 30;
        const difference = touchStartX - touchEndX;
        
        if (Math.abs(difference) > swipeThreshold) {
            if (difference > 0) {
                // Swipe left
                nextSlide();
            } else {
                // Swipe right
                currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
                showSlide(currentSlide);
            }
        }
    }

    // Add click events for dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentSlide = index;
            showSlide(currentSlide);
        });
    });

    // Add hover pause/resume functionality
    let interval;
    
    function startAutoSlide() {
        interval = setInterval(nextSlide, 3000);
    }
    
    function stopAutoSlide() {
        clearInterval(interval);
    }
    
    slider.addEventListener('mouseenter', stopAutoSlide);
    slider.addEventListener('mouseleave', startAutoSlide);
    
    // Start auto-sliding
    startAutoSlide();
    
    } catch (error) {
        console.error('Slider initialization error:', error);
    }
});
