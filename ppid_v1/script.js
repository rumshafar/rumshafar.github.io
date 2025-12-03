document.addEventListener('DOMContentLoaded', () => {
    // Kode untuk Toggle Menu di Mobile
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        
        // Ubah icon dari bars ke times (X)
        const icon = hamburger.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Kode Opsional untuk Galeri Scroll (Tombol Next/Prev)
    const galleryContainer = document.querySelector('.gallery-images');
    const nextBtn = document.querySelector('.gallery-btn.next');
    const prevBtn = document.querySelector('.gallery-btn.prev');

    if(nextBtn && prevBtn && galleryContainer) {
        nextBtn.addEventListener('click', () => {
            galleryContainer.scrollBy({ left: 300, behavior: 'smooth' });
        });

        prevBtn.addEventListener('click', () => {
            galleryContainer.scrollBy({ left: -300, behavior: 'smooth' });
        });
    }
});