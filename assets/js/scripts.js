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
let isInitialLoad = true; // Добавляем флаг первоначальной загрузки

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

    // Убираем автоматическую активацию первой кнопки при загрузке
    if (isInitialLoad) {
        // Определяем активную секцию на основе скролла при загрузке
        setTimeout(() => {
            const scrollY = window.scrollY;
            const scrollSectionRect = scrollSection.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            if (scrollSectionRect.top <= 0 && scrollSectionRect.bottom >= 0) {
                // Если скролл-секция в зоне видимости, определяем активную секцию по скроллу
                const scrollStart = scrollSection.offsetTop;
                const scrollEnd = scrollStart + scrollSection.offsetHeight - windowHeight;
                const scrollProgress = (scrollY - scrollStart) / (scrollEnd - scrollStart);

                let initialIndex = Math.floor(scrollProgress * MATERIAL_SECTIONS.length);
                initialIndex = Math.max(0, Math.min(initialIndex, MATERIAL_SECTIONS.length - 1));

                if (initialIndex !== 0) {
                    activeIndex = initialIndex;
                    updateUI(false);
                }
            }

            isInitialLoad = false;
        }, 100);
    }

    updateUI(false);

    initScrollTracking();
}

function initScrollTracking() {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
        // Игнорируем скролл во время первоначальной загрузки
        if (isInitialLoad) return;

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

    if ('ontouchstart' in window) {
        let mobileScrollTimeout;
        window.addEventListener('scroll', () => {
            if (!mobileScrollTimeout) {
                mobileScrollTimeout = setTimeout(() => {
                    handleScroll();
                    mobileScrollTimeout = null;
                }, 70);
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

    if (scrollSectionRect.top > windowHeight || scrollSectionRect.bottom < 0) {
        return;
    }

    const scrollStart = scrollSection.offsetTop;
    const scrollEnd = scrollStart + scrollSection.offsetHeight - windowHeight;

    const constrainedScroll = Math.max(scrollStart, Math.min(scrollY, scrollEnd));
    const scrollProgress = (constrainedScroll - scrollStart) / (scrollEnd - scrollStart);

    let newIndex = Math.floor(scrollProgress * MATERIAL_SECTIONS.length);
    newIndex = Math.max(0, Math.min(newIndex, MATERIAL_SECTIONS.length - 1));

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

    if (window.innerWidth <= 990) {
        if (animDirection === 'next') {
            currentImage.classList.add('slide-out-left-mobile');
            nextImage.classList.add('slide-in-right-mobile');
        } else {
            currentImage.classList.add('slide-out-right-mobile');
            nextImage.classList.add('slide-in-left-mobile');
        }
    } else {
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

    // Очищаем все активные классы перед установкой нового
    buttons.forEach(btn => {
        btn.classList.remove('active');
    });

    // Активируем только текущую кнопку
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

    // Всегда очищаем все кнопки перед установкой активной
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

initUI();

window.addEventListener('resize', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        updateUI(false);
    }, 100);
});