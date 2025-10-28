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

function initUI() {
    sidebar.innerHTML = '';
    imageArea.innerHTML = '';

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

        if (i === 0) {
            img.classList.add('active');
        }

        imageArea.appendChild(img);
        images.push(img);
    });

    buttons = Array.from(sidebar.querySelectorAll('button'));

    setTimeout(() => {
        contentTitle.classList.add('active');
        contentText.classList.add('active');
        contentButton.classList.add('active');
        buttons[0].classList.add('active');
    }, 100);

    updateUI(false);

    // Инициализируем скролл-трекинг
    initScrollTracking();
}

function initScrollTracking() {
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

    // Для мобильных - просто добавляем небольшую задержку
    if ('ontouchstart' in window) {
        let mobileScrollTimeout;
        window.addEventListener('scroll', () => {
            if (!mobileScrollTimeout) {
                mobileScrollTimeout = setTimeout(() => {
                    handleScroll();
                    mobileScrollTimeout = null;
                }, 70); // Небольшая задержка для мобильных
            }
        }, { passive: true });
    } else {
        window.addEventListener('scroll', handleScroll, { passive: true });
    }
}

function updateActiveSection(scrollY, direction) {
    if (isAnimating) return;

    const scrollSectionRect = scrollSection.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Проверяем, находится ли скролл-секция в области видимости
    if (scrollSectionRect.top > windowHeight || scrollSectionRect.bottom < 0) {
        return; // Скролл-секция не видна
    }

    // Рассчитываем прогресс внутри скролл-секции
    const scrollStart = scrollSection.offsetTop;
    const scrollEnd = scrollStart + scrollSection.offsetHeight - windowHeight;

    // Ограничиваем скролл границами секции
    const constrainedScroll = Math.max(scrollStart, Math.min(scrollY, scrollEnd));
    const scrollProgress = (constrainedScroll - scrollStart) / (scrollEnd - scrollStart);

    // Определяем активную секцию
    let newIndex = Math.floor(scrollProgress * MATERIAL_SECTIONS.length);
    newIndex = Math.max(0, Math.min(newIndex, MATERIAL_SECTIONS.length - 1));

    // Для мобильных - добавляем небольшую задержку чтобы избежать проскакивания
    const delay = ('ontouchstart' in window) ? 80 : 50;

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
    scrollToSection(activeIndex);

    setTimeout(() => {
        isAnimating = false;
    }, 600);
}

function animateImages(prevIndex, newIndex, direction) {
    const currentImage = images[prevIndex];
    const nextImage = images[newIndex];

    if (!currentImage || !nextImage) return;

    // Сбрасываем все классы анимации
    images.forEach(img => {
        img.classList.remove(
            'slide-out-top-pc', 'slide-out-bottom-pc',
            'slide-in-top-pc', 'slide-in-bottom-pc',
            'slide-out-left-mobile', 'slide-out-right-mobile',
            'slide-in-left-mobile', 'slide-in-right-mobile',
            'active'
        );
    });

    // Определяем направление для анимации
    const isNext = newIndex > prevIndex;
    const animDirection = isNext ? 'next' : 'prev';

    if (window.innerWidth <= 990) {
        // Мобильная анимация
        if (animDirection === 'next') {
            currentImage.classList.add('slide-out-left-mobile');
            nextImage.classList.add('slide-in-right-mobile');
        } else {
            currentImage.classList.add('slide-out-right-mobile');
            nextImage.classList.add('slide-in-left-mobile');
        }
    } else {
        // Десктопная анимация
        if (animDirection === 'next') {
            currentImage.classList.add('slide-out-top-pc');
            nextImage.classList.add('slide-in-bottom-pc');
        } else {
            currentImage.classList.add('slide-out-bottom-pc');
            nextImage.classList.add('slide-in-top-pc');
        }
    }

    nextImage.classList.add('active');

    // Убираем классы анимации после завершения
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

    buttons.forEach((btn, index) => {
        btn.classList.toggle('active', index === activeIndex);
    });

    // Анимация появления контента
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
    const scrollSectionRect = scrollSection.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const sectionHeight = scrollSection.offsetHeight / MATERIAL_SECTIONS.length;

    // Позиционируем так, чтобы секция была по центру экрана
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

    buttons.forEach((btn, index) => {
        btn.classList.toggle('active', index === activeIndex);
    });

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

// Ресайз
window.addEventListener('resize', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        updateUI(false);
    }, 100);
});