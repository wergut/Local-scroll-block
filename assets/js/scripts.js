const stickyPanel = document.getElementById('stickyPanel');
const sidebar = document.getElementById('sidebar');
const contentArea = document.getElementById('contentArea');
const contentTitle = document.getElementById('content-title');
const contentText = document.getElementById('content-text');
const contentButton = document.getElementById('content-button');
const imageArea = document.getElementById('imageArea');
const scrollSection = document.querySelector('.scroll-section');

let buttons = [];
let images = [];
let activeIndex = 0;
let previousIndex = 0;
let isAnimating = false;
let scrollTimeout = null;
let lastScrollY = 0;
let ignoreScroll = false;

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
}

function handleButtonClick(newIndex) {
    if (isAnimating || newIndex === activeIndex) return;

    isAnimating = true;
    ignoreScroll = true;
    previousIndex = activeIndex;
    activeIndex = newIndex;

    const direction = newIndex > previousIndex ? 'next' : 'prev';
    animateImages(direction);
    updateContent();
    scrollToSection(activeIndex);

    setTimeout(() => {
        isAnimating = false;
        setTimeout(() => {
            ignoreScroll = false;
        }, 500);
    }, 800);
}

function handleScrollChange(newIndex) {
    if (isAnimating || newIndex === activeIndex) return;

    isAnimating = true;
    previousIndex = activeIndex;
    activeIndex = newIndex;

    const direction = newIndex > previousIndex ? 'next' : 'prev';
    animateImages(direction);
    updateContent();

    setTimeout(() => {
        isAnimating = false;
    }, 600);
}

function getDirection(oldIndex, newIndex) {
    const scrollDirection = window.scrollY > lastScrollY ? 'down' : 'up';
    lastScrollY = window.scrollY;

    if (scrollDirection === 'down') {
        return 'next';
    } else {
        return 'prev';
    }
}

function animateImages(direction) {
    const currentImage = images[previousIndex];
    const nextImage = images[activeIndex];

    if (!currentImage || !nextImage) return;

    images.forEach(img => {
        img.classList.remove(
            'slide-out-top-pc', 'slide-out-bottom-pc',
            'slide-in-top-pc', 'slide-in-bottom-pc',
            'slide-out-left-mobile', 'slide-out-right-mobile',
            'slide-in-left-mobile', 'slide-in-right-mobile'
        );
    });

    if (window.innerWidth <= 990) {
        if (direction === 'next') {
            currentImage.classList.add('slide-out-left-mobile');
            nextImage.classList.add('slide-in-right-mobile');
        } else {
            currentImage.classList.add('slide-out-right-mobile');
            nextImage.classList.add('slide-in-left-mobile');
        }
    } else {
        if (direction === 'next') {
            currentImage.classList.add('slide-out-top-pc');
            nextImage.classList.add('slide-in-bottom-pc');
        } else {
            currentImage.classList.add('slide-out-bottom-pc');
            nextImage.classList.add('slide-in-top-pc');
        }
    }

    setTimeout(() => {
        currentImage.classList.remove('active');
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
        }, 100);
    }, 400);
}

function updateContent() {
    const section = MATERIAL_SECTIONS[activeIndex];

    stickyPanel.style.backgroundColor = section.bgColor;
    contentTitle.textContent = section.title;
    contentText.textContent = section.text;
    contentButton.textContent = section.buttonText;
    contentButton.href = section.link;
    contentButton.setAttribute('target', '_blank');

    buttons.forEach((btn, index) => {
        if (index === activeIndex) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

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
    }, 200);
}

function scrollToSection(index) {
    const scrollSectionRect = scrollSection.getBoundingClientRect();
    const scrollSectionTop = scrollSectionRect.top + window.scrollY;
    const sectionHeight = window.innerHeight * 0.4;

    let targetScroll;
    if (window.innerWidth <= 990) {
        const maxScroll = scrollSectionTop + scrollSectionRect.height - window.innerHeight;
        const calculatedScroll = scrollSectionTop + (index * sectionHeight);
        targetScroll = Math.min(calculatedScroll, maxScroll);
    } else {
        targetScroll = scrollSectionTop + (index * sectionHeight);
    }

    window.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
    });
}

function getCurrentSectionIndex() {
    const scrollY = window.scrollY;
    const scrollSectionRect = scrollSection.getBoundingClientRect();
    const scrollSectionTop = scrollSectionRect.top + window.scrollY;
    const scrollSectionHeight = scrollSectionRect.height;

    if (scrollY < scrollSectionTop) return 0;
    if (scrollY >= scrollSectionTop + scrollSectionHeight - 10) return MATERIAL_SECTIONS.length - 1;

    const viewportCenter = scrollY + window.innerHeight / 2;
    const relativePosition = viewportCenter - scrollSectionTop;
    const sectionHeight = scrollSectionHeight / MATERIAL_SECTIONS.length;

    // Вычисляем точный прогресс внутри текущей секции
    const progressInSection = (relativePosition % sectionHeight) / sectionHeight;

    // Определяем базовый индекс
    let baseIndex = Math.floor(relativePosition / sectionHeight);
    baseIndex = Math.min(MATERIAL_SECTIONS.length - 1, Math.max(0, baseIndex));

    // Решаем, нужно ли переключаться на следующую секцию
    if (progressInSection > 0.7 && baseIndex < MATERIAL_SECTIONS.length - 1) {
        return baseIndex + 1;
    } else if (progressInSection < 0.3 && baseIndex > 0) {
        return baseIndex - 1;
    }

    return baseIndex;
}

function updateUI(withAnimation = true) {
    const section = MATERIAL_SECTIONS[activeIndex];

    stickyPanel.style.backgroundColor = section.bgColor;
    contentTitle.textContent = section.title;
    contentText.textContent = section.text;
    contentButton.textContent = section.buttonText;
    contentButton.href = section.link;
    contentButton.setAttribute('target', '_blank');

    buttons.forEach((btn, index) => {
        if (index === activeIndex) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
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

function onScroll() {
    if (scrollTimeout) {
        clearTimeout(scrollTimeout);
    }

    scrollTimeout = setTimeout(() => {
        if (isAnimating || ignoreScroll) return;

        const newIndex = getCurrentSectionIndex();
        if (newIndex !== activeIndex) {
            handleScrollChange(newIndex);
        }
    }, 100);
}

initUI();
window.addEventListener('scroll', onScroll);
window.addEventListener('resize', () => {
    setTimeout(() => updateUI(false), 100);
});