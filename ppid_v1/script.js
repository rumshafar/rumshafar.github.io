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

/* =========================================
   FUNGSI MEMUAT HEADER & FOOTER
   ========================================= */

// Panggil fungsi ini saat halaman dimuat
document.addEventListener("DOMContentLoaded", function() {
    loadComponent('header-placeholder', 'header.html');
    loadComponent('footer-placeholder', 'footer.html');
});

function loadComponent(id, file) {
    fetch(file)
        .then(response => {
            if (!response.ok) throw new Error("Gagal memuat " + file);
            return response.text();
        })
        .then(data => {
            document.getElementById(id).innerHTML = data;
            
            // Khusus untuk Header, kita perlu inisialisasi menu & active state
            // setelah HTML-nya selesai dimuat
            if(file === 'header.html') {
                initMenu();      // Jalankan fungsi hamburger menu
                setActivePage(); // Jalankan fungsi penanda halaman aktif
            }
        })
        .catch(error => console.error('Error:', error));
}

/* =========================================
   LOGIKA NAVBAR (Active State & Hamburger)
   ========================================= */

function setActivePage() {
    // Ambil nama file dari URL
    let currentPage = window.location.pathname.split("/").pop();
    if (currentPage === "") currentPage = "index.html";

    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');

        // Cek kesamaan link
        if (linkHref === currentPage) {
            link.classList.add('active');

            // Cek jika ada di dalam dropdown (Parent juga aktif)
            const parentDropdown = link.closest('.dropdown');
            if (parentDropdown) {
                // Cari elemen <a> milik parent dropdown tersebut
                const parentLink = parentDropdown.querySelector('a'); 
                if(parentLink) parentLink.classList.add('active');
            }
        }
    });
}

function initMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    // Pastikan elemen ada sebelum menambah event listener
    if(hamburger && navLinks) {
        // Hapus listener lama jika ada (opsional, untuk mencegah double click)
        const newHamburger = hamburger.cloneNode(true);
        hamburger.parentNode.replaceChild(newHamburger, hamburger);

        newHamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
}