(function() {
    'use strict';
    
    const API_URL = yandexReviewsConfig.apiUrl;
    let reviews = [];
    let currentIndex = 0;
    const REVIEWS_PER_PAGE = 3;
    
    function init() {
        const widgets = document.querySelectorAll('.yandex-reviews-widget');
        widgets.forEach(widget => {
            const orgUrl = widget.dataset.orgUrl || yandexReviewsConfig.yandexUrl;
            loadReviews(widget, orgUrl);
        });
    }
    
    async function loadReviews(widget, orgUrl) {
        const loading = widget.querySelector('#yrw-loading');
        const content = widget.querySelector('#yrw-content');
        
        try {
            const response = await fetch(`${API_URL}?url=${encodeURIComponent(orgUrl)}`);
            const data = await response.json();
            
            if (data.reviews && Array.isArray(data.reviews)) {
                reviews = data.reviews;
                renderWidget(widget);
                loading.style.display = 'none';
                content.style.display = 'block';
            }
        } catch (error) {
            console.error('Ошибка загрузки отзывов:', error);
            loading.innerHTML = '<p>Не удалось загрузить отзывы</p>';
        }
    }
    
    function renderWidget(widget) {
        const averageRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
        
        const starsContainer = widget.querySelector('#yrw-stars');
        starsContainer.innerHTML = renderStars(Math.round(parseFloat(averageRating)));
        
        widget.querySelector('#yrw-rating-value').textContent = averageRating;
        widget.querySelector('#yrw-reviews-count').textContent = `(${reviews.length} отзывов)`;
        
        renderReviews(widget);
        renderDots(widget);
        setupNavigation(widget);
    }
    
    function renderStars(rating) {
        let html = '';
        for (let i = 0; i < 5; i++) {
            const className = i < rating ? 'filled' : 'empty';
            html += `<svg class="yrw-star ${className}" width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>`;
        }
        return html;
    }
    
    function renderReviews(widget) {
        const grid = widget.querySelector('#yrw-reviews-grid');
        const displayedReviews = reviews.slice(currentIndex, currentIndex + REVIEWS_PER_PAGE);
        
        grid.innerHTML = displayedReviews.map(review => `
            <div class="yrw-review-card">
                <div class="yrw-review-header">
                    <div class="yrw-avatar">
                        ${review.author.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div class="yrw-author-info">
                        <div class="yrw-author-name">${escapeHtml(review.author)}</div>
                        <div class="yrw-review-date">${formatDate(review.date)}</div>
                    </div>
                </div>
                <div class="yrw-review-stars">
                    ${renderStars(review.rating)}
                </div>
                <p class="yrw-review-text">${escapeHtml(review.text)}</p>
            </div>
        `).join('');
    }
    
    function renderDots(widget) {
        const dotsContainer = widget.querySelector('#yrw-dots');
        const totalPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);
        
        dotsContainer.innerHTML = Array.from({ length: totalPages }).map((_, idx) => {
            const isActive = Math.floor(currentIndex / REVIEWS_PER_PAGE) === idx ? 'active' : '';
            return `<button class="yrw-dot ${isActive}" data-index="${idx}"></button>`;
        }).join('');
        
        dotsContainer.querySelectorAll('.yrw-dot').forEach(dot => {
            dot.addEventListener('click', function() {
                currentIndex = parseInt(this.dataset.index) * REVIEWS_PER_PAGE;
                renderReviews(widget);
                renderDots(widget);
                updateButtons(widget);
            });
        });
    }
    
    function setupNavigation(widget) {
        const prevBtn = widget.querySelector('#yrw-prev');
        const nextBtn = widget.querySelector('#yrw-next');
        
        prevBtn.addEventListener('click', () => {
            if (currentIndex - REVIEWS_PER_PAGE >= 0) {
                currentIndex -= REVIEWS_PER_PAGE;
                renderReviews(widget);
                renderDots(widget);
                updateButtons(widget);
            }
        });
        
        nextBtn.addEventListener('click', () => {
            if (currentIndex + REVIEWS_PER_PAGE < reviews.length) {
                currentIndex += REVIEWS_PER_PAGE;
                renderReviews(widget);
                renderDots(widget);
                updateButtons(widget);
            }
        });
        
        updateButtons(widget);
    }
    
    function updateButtons(widget) {
        const prevBtn = widget.querySelector('#yrw-prev');
        const nextBtn = widget.querySelector('#yrw-next');
        
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex + REVIEWS_PER_PAGE >= reviews.length;
    }
    
    function formatDate(dateStr) {
        const date = new Date(dateStr);
        const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    }
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
