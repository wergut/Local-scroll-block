const stickyPanel = document.getElementById('stickyPanel');
const sidebar = document.getElementById('sidebar');
const contentTitle = document.getElementById('content-title');
const contentText = document.getElementById('content-text');
const contentButton = document.getElementById('content-button');
const imageArea = document.getElementById('imageArea');
const scrollSection = document.querySelector('.scroll-section');

let buttons = [];
let images = [];
let activeIndex = 0;
let isAnimating = false;
let scrollTimeout;
let isMobile = window.innerWidth <= 990;

function initUI() {
    sidebar.innerHTML = '';
    imageArea.innerHTML = '';

    // Определяем активный индекс только для десктопа
    if (!isMobile) {
        const scrollY = window.scrollY;
        const scrollSectionRect = scrollSection.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        if (scrollSectionRect.top <= 0 && scrollSectionRect.bottom >= 0) {
            const scrollStart = scrollSection.offsetTop;
            const scrollEnd = scrollStart + scrollSection.offsetHeight - windowHeight;
            const scrollProgress = Math.max(0, Math.min(1, (scrollY - scrollStart) / (scrollEnd - scrollStart)));

            let initialIndex = Math.floor(scrollProgress * MATERIAL_SECTIONS.length);
            initialIndex = Math.max(0, Math.min(initialIndex, MATERIAL_SECTIONS.length - 1));

            if (initialIndex !== 0) {
                activeIndex = initialIndex;
            }
        }
    }

    // Создаем интерфейс
    MATERIAL_SECTIONS.forEach((section, i) => {
        const btn = document.createElement('button');
        const span = document.createElement('span');
        span.className = 'label';
        span.textContent = section.navTitle;
        btn.appendChild(span);
        btn.dataset.index = i;

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (isAnimating) return;
            const targetIndex = parseInt(btn.dataset.index);
            handleButtonClick(targetIndex);
        });

        sidebar.appendChild(btn);
    });

    MATERIAL_SECTIONS.forEach((section, i) => {
        const img = document.createElement('img');
        img.className = 'section-image';
        img.src = section.image;
        img.alt = section.title;
        img.dataset.index = i;

        if (i === activeIndex) {
            img.classList.add('active');
        }

        imageArea.appendChild(img);
        images.push(img);
    });

    buttons = Array.from(sidebar.querySelectorAll('button'));

    // Сразу устанавливаем правильное состояние
    updateUI(false);

    // Инициализируем навигацию в зависимости от устройства
    if (isMobile) {
        initMobileNavigation();
    } else {
        initDesktopNavigation();
    }
}

function initMobileNavigation() {
    console.log('Mobile: Scroll disabled, tabs only');
    // На мобильных отключаем скролл-трекинг
    // Оставляем только клики по табам
}

function initDesktopNavigation() {
    console.log('Desktop: Scroll enabled');

    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
        const currentScrollY = window.scrollY;
        const scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
        lastScrollY = currentScrollY;

        if (!ticking) {
            requestAnimationFrame(() => {
                updateActiveSection(currentScrollY, scrollDirection);
                ticking = false;
            });
            ticking = true;
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
}

function updateActiveSection(scrollY, direction) {
    if (isAnimating || isMobile) return; // На мобильных не обрабатываем скролл

    const scrollSectionRect = scrollSection.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    if (scrollSectionRect.top > windowHeight || scrollSectionRect.bottom < 0) {
        return;
    }

    const scrollStart = scrollSection.offsetTop;
    const scrollEnd = scrollStart + scrollSection.offsetHeight - windowHeight;

    const constrainedScroll = Math.max(scrollStart, Math.min(scrollY, scrollEnd));
    const scrollProgress = (constrainedScroll - scrollStart) / (scrollEnd - scrollStart);

    let newIndex = Math.floor(scrollProgress * MATERIAL_SECTIONS.length);
    newIndex = Math.max(0, Math.min(newIndex, MATERIAL_SECTIONS.length - 1));

    const delay = 50;

    if (newIndex !== activeIndex) {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            handleScrollChange(newIndex, direction);
        }, delay);
    }
}

function handleScrollChange(newIndex, direction) {
    if (isAnimating || newIndex === activeIndex) return;

    isAnimating = true;
    const previousIndex = activeIndex;
    activeIndex = newIndex;

    animateImages(previousIndex, activeIndex, direction);
    updateContent();

    setTimeout(() => {
        isAnimating = false;
    }, 500);
}

function handleButtonClick(newIndex) {
    if (isAnimating || newIndex === activeIndex) return;

    isAnimating = true;
    const previousIndex = activeIndex;
    activeIndex = newIndex;

    const direction = newIndex > previousIndex ? 'next' : 'prev';
    animateImages(previousIndex, activeIndex, direction);
    updateContent();

    // На мобильных не скроллим страницу
    if (!isMobile) {
        scrollToSection(activeIndex);
    }

    setTimeout(() => {
        isAnimating = false;
    }, 600);
}

function animateImages(prevIndex, newIndex, direction) {
    const currentImage = images[prevIndex];
    const nextImage = images[newIndex];

    if (!currentImage || !nextImage) return;

    images.forEach(img => {
        img.classList.remove(
            'slide-out-top-pc', 'slide-out-bottom-pc',
            'slide-in-top-pc', 'slide-in-bottom-pc',
            'slide-out-left-mobile', 'slide-out-right-mobile',
            'slide-in-left-mobile', 'slide-in-right-mobile',
            'active'
        );
    });

    const isNext = newIndex > prevIndex;
    const animDirection = isNext ? 'next' : 'prev';

    if (isMobile) {
        // На мобильных простая смена без сложных анимаций
        if (animDirection === 'next') {
            currentImage.classList.add('slide-out-left-mobile');
            nextImage.classList.add('slide-in-right-mobile');
        } else {
            currentImage.classList.add('slide-out-right-mobile');
            nextImage.classList.add('slide-in-left-mobile');
        }
    } else {
        // На десктопе полноценные анимации
        if (animDirection === 'next') {
            currentImage.classList.add('slide-out-top-pc');
            nextImage.classList.add('slide-in-bottom-pc');
        } else {
            currentImage.classList.add('slide-out-bottom-pc');
            nextImage.classList.add('slide-in-top-pc');
        }
    }

    nextImage.classList.add('active');

    setTimeout(() => {
        currentImage.classList.remove(
            'slide-out-top-pc', 'slide-out-bottom-pc',
            'slide-out-left-mobile', 'slide-out-right-mobile'
        );
        nextImage.classList.remove(
            'slide-in-top-pc', 'slide-in-bottom-pc',
            'slide-in-left-mobile', 'slide-in-right-mobile'
        );
    }, 500);
}

function updateContent() {
    const section = MATERIAL_SECTIONS[activeIndex];

    stickyPanel.style.backgroundColor = section.bgColor;
    contentTitle.textContent = section.title;
    contentText.textContent = section.text;
    contentButton.textContent = section.buttonText;
    contentButton.href = section.link;

    buttons.forEach(btn => {
        btn.classList.remove('active');
    });

    if (buttons[activeIndex]) {
        buttons[activeIndex].classList.add('active');
    }

    contentTitle.classList.remove('active');
    contentText.classList.remove('active');
    contentButton.classList.remove('active');

    setTimeout(() => {
        contentTitle.classList.add('active');
        setTimeout(() => {
            contentText.classList.add('active');
            setTimeout(() => {
                contentButton.classList.add('active');
            }, 100);
        }, 100);
    }, 150);
}

function scrollToSection(index) {
    if (isMobile) return; // На мобильных не скроллим

    const scrollSectionRect = scrollSection.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const sectionHeight = scrollSection.offsetHeight / MATERIAL_SECTIONS.length;

    const targetScroll = scrollSection.offsetTop + (sectionHeight * index) + (sectionHeight / 2) - (windowHeight / 2);

    window.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
    });
}

function updateUI(withAnimation = true) {
    const section = MATERIAL_SECTIONS[activeIndex];

    stickyPanel.style.backgroundColor = section.bgColor;
    contentTitle.textContent = section.title;
    contentText.textContent = section.text;
    contentButton.textContent = section.buttonText;
    contentButton.href = section.link;

    buttons.forEach(btn => {
        btn.classList.remove('active');
    });

    if (buttons[activeIndex]) {
        buttons[activeIndex].classList.add('active');
    }

    if (withAnimation) {
        contentTitle.classList.remove('active');
        contentText.classList.remove('active');
        contentButton.classList.remove('active');

        setTimeout(() => {
            contentTitle.classList.add('active');
            setTimeout(() => {
                contentText.classList.add('active');
                setTimeout(() => {
                    contentButton.classList.add('active');
                }, 100);
            }, 100);
        }, 50);
    } else {
        contentTitle.classList.add('active');
        contentText.classList.add('active');
        contentButton.classList.add('active');
    }
}

// Инициализация
initUI();

// Обработчик ресайза
window.addEventListener('resize', () => {
    clearTimeout(scrollTimeout);

    const newIsMobile = window.innerWidth <= 990;

    // Если изменился тип устройства, переинициализируем
    if (newIsMobile !== isMobile) {
        isMobile = newIsMobile;
        // Перезапускаем навигацию при смене устройства
        if (isMobile) {
            initMobileNavigation();
        } else {
            initDesktopNavigation();
        }
    }

    scrollTimeout = setTimeout(() => {
        updateUI(false);
    }, 100);
});