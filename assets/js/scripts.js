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
let isAnimating = false;
let scrollTimeout = null;

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
            scrollToSection(i);
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

function scrollToSection(index) {
    if (isAnimating) return;
    if (index === activeIndex) return;

    isAnimating = true;

    const previousIndex = activeIndex;
    activeIndex = index;

    if (images[previousIndex]) {
        images[previousIndex].classList.remove('active');
    }
    contentTitle.classList.remove('active');
    contentText.classList.remove('active');
    contentButton.classList.remove('active');
    buttons[previousIndex].classList.remove('active');

    updateUI(false);

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

    setTimeout(() => {
        isAnimating = false;
    }, 500);
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
    const index = Math.floor(relativePosition / (scrollSectionHeight / MATERIAL_SECTIONS.length));

    return Math.min(MATERIAL_SECTIONS.length - 1, Math.max(0, index));
}

function updateUI(withAnimation = true) {
    const section = MATERIAL_SECTIONS[activeIndex];

    stickyPanel.style.backgroundColor = section.bgColor;

    contentTitle.textContent = section.title;
    contentText.textContent = section.text;
    contentButton.textContent = section.buttonText;
    contentButton.href = section.link;
    contentButton.setAttribute('target', '_blank');

    images.forEach((img, index) => {
        if (index === activeIndex) {
            img.classList.add('active');
        } else {
            img.classList.remove('active');
        }
    });

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
        if (isAnimating) return;

        const newIndex = getCurrentSectionIndex();
        if (newIndex !== activeIndex) {
            const currentImage = images[activeIndex];
            if (currentImage) {
                currentImage.classList.remove('active');
            }
            contentTitle.classList.remove('active');
            contentText.classList.remove('active');
            contentButton.classList.remove('active');
            buttons[activeIndex].classList.remove('active');

            activeIndex = newIndex;
            updateUI(true);
        }
    }, 100);
}

initUI();
window.addEventListener('scroll', onScroll);
window.addEventListener('resize', () => {
    setTimeout(() => updateUI(false), 100);
});