(function() {
    'use strict';
    
    const API_URL = yandexReviewsConfig.apiUrl;
    let allReviews = [];
    let filteredReviews = [];
    let currentIndex = 0;
    let currentRating = 'all';
    let currentSort = yandexReviewsConfig.defaultSort || 'date';
    
    function init() {
        const widgets = document.querySelectorAll('.yandex-reviews-widget');
        widgets.forEach(widget => {
            const orgUrl = widget.dataset.orgUrl || yandexReviewsConfig.yandexUrl;
            const layout = widget.dataset.layout || yandexReviewsConfig.layout;
            
            widget.widgetData = {
                layout: layout,
                showFilters: widget.dataset.showFilters === '1',
                reviewsPerPage: getReviewsPerPage(layout)
            };
            
            loadReviews(widget, orgUrl);
        });
    }
    
    function getReviewsPerPage(layout) {
        switch(layout) {
            case '1-column': return 5;
            case '2-column': return 6;
            case '3-column': return 9;
            case 'slider': return 3;
            default: return 3;
        }
    }
    
    async function loadReviews(widget, orgUrl) {
        const loading = widget.querySelector('#yrw-loading');
        const content = widget.querySelector('#yrw-content');
        
        try {
            const response = await fetch(`${API_URL}?url=${encodeURIComponent(orgUrl)}`);
            const data = await response.json();
            
            if (data.reviews && Array.isArray(data.reviews)) {
                allReviews = data.reviews;
                filteredReviews = [...allReviews];
                
                sortReviews(currentSort);
                renderWidget(widget);
                
                loading.style.display = 'none';
                content.style.display = 'block';
                
                if (widget.widgetData.showFilters) {
                    const filters = widget.querySelector('#yrw-filters');
                    if (filters) {
                        filters.style.display = 'flex';
                        setupFilters(widget);
                    }
                }
            }
        } catch (error) {
            console.error('Ошибка загрузки отзывов:', error);
            loading.innerHTML = '<p>Не удалось загрузить отзывы</p>';
        }
    }
    
    function setupFilters(widget) {
        const filterBtns = widget.querySelectorAll('.yrw-filter-btn');
        const sortSelect = widget.querySelector('#yrw-sort');
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                currentRating = this.dataset.rating;
                currentIndex = 0;
                applyFilters(widget);
            });
        });
        
        if (sortSelect) {
            sortSelect.value = currentSort;
            sortSelect.addEventListener('change', function() {
                currentSort = this.value;
                currentIndex = 0;
                sortReviews(currentSort);
                renderReviews(widget);
                renderDots(widget);
                updateButtons(widget);
            });
        }
    }
    
    function applyFilters(widget) {
        if (currentRating === 'all') {
            filteredReviews = [...allReviews];
        } else {
            const rating = parseInt(currentRating);
            filteredReviews = allReviews.filter(r => r.rating === rating);
        }
        
        sortReviews(currentSort);
        renderReviews(widget);
        renderDots(widget);
        updateButtons(widget);
    }
    
    function sortReviews(sortType) {
        if (sortType === 'date') {
            filteredReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else if (sortType === 'rating') {
            filteredReviews.sort((a, b) => b.rating - a.rating);
        }
    }
    
    function renderWidget(widget) {
        const averageRating = (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1);
        
        const starsContainer = widget.querySelector('#yrw-stars');
        starsContainer.innerHTML = renderStars(Math.round(parseFloat(averageRating)));
        
        widget.querySelector('#yrw-rating-value').textContent = averageRating;
        widget.querySelector('#yrw-reviews-count').textContent = `(${allReviews.length} отзывов)`;
        
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
        const reviewsPerPage = widget.widgetData.reviewsPerPage;
        
        let displayedReviews;
        if (widget.widgetData.layout === 'slider') {
            displayedReviews = filteredReviews.slice(currentIndex, currentIndex + reviewsPerPage);
        } else {
            displayedReviews = filteredReviews;
        }
        
        if (displayedReviews.length === 0) {
            grid.innerHTML = '<p style="text-align: center; padding: 2rem; grid-column: 1/-1;">Нет отзывов по выбранным фильтрам</p>';
            return;
        }
        
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
        
        if (widget.widgetData.layout !== 'slider') {
            dotsContainer.innerHTML = '';
            return;
        }
        
        const reviewsPerPage = widget.widgetData.reviewsPerPage;
        const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);
        
        dotsContainer.innerHTML = Array.from({ length: totalPages }).map((_, idx) => {
            const isActive = Math.floor(currentIndex / reviewsPerPage) === idx ? 'active' : '';
            return `<button class="yrw-dot ${isActive}" data-index="${idx}"></button>`;
        }).join('');
        
        dotsContainer.querySelectorAll('.yrw-dot').forEach(dot => {
            dot.addEventListener('click', function() {
                const reviewsPerPage = widget.widgetData.reviewsPerPage;
                currentIndex = parseInt(this.dataset.index) * reviewsPerPage;
                renderReviews(widget);
                renderDots(widget);
                updateButtons(widget);
            });
        });
    }
    
    function setupNavigation(widget) {
        const prevBtn = widget.querySelector('#yrw-prev');
        const nextBtn = widget.querySelector('#yrw-next');
        
        if (!prevBtn || !nextBtn) return;
        
        prevBtn.addEventListener('click', () => {
            const reviewsPerPage = widget.widgetData.reviewsPerPage;
            if (currentIndex - reviewsPerPage >= 0) {
                currentIndex -= reviewsPerPage;
                renderReviews(widget);
                renderDots(widget);
                updateButtons(widget);
            }
        });
        
        nextBtn.addEventListener('click', () => {
            const reviewsPerPage = widget.widgetData.reviewsPerPage;
            if (currentIndex + reviewsPerPage < filteredReviews.length) {
                currentIndex += reviewsPerPage;
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
        
        if (!prevBtn || !nextBtn) return;
        
        const reviewsPerPage = widget.widgetData.reviewsPerPage;
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex + reviewsPerPage >= filteredReviews.length;
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
