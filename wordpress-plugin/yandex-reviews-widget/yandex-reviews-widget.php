<?php
/**
 * Plugin Name: Yandex Reviews Widget - Легенда
 * Plugin URI: https://preview--yandex-review-widget.poehali.dev/
 * Description: Виджет отзывов с Яндекс.Карт для стоматологической клиники "ЛЕГЕНДА"
 * Version: 1.0.0
 * Author: poehali.dev
 * Author URI: https://poehali.dev
 * License: GPL v2 or later
 * Text Domain: yandex-reviews-widget
 */

if (!defined('ABSPATH')) {
    exit;
}

class Yandex_Reviews_Widget {
    
    private $api_url = 'https://functions.poehali.dev/2f1be17c-7fae-4c8f-b196-0ab0f7e57060';
    private $yandex_url = 'https://yandex.ru/maps/org/legenda/88154393306/';
    
    public function __construct() {
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_shortcode('yandex_reviews', array($this, 'render_widget'));
        add_action('widgets_init', array($this, 'register_widget'));
    }
    
    public function enqueue_scripts() {
        wp_enqueue_style(
            'yandex-reviews-widget-style',
            plugins_url('assets/style.css', __FILE__),
            array(),
            '1.0.0'
        );
        
        wp_enqueue_script(
            'yandex-reviews-widget-script',
            plugins_url('assets/script.js', __FILE__),
            array(),
            '1.0.0',
            true
        );
        
        wp_localize_script('yandex-reviews-widget-script', 'yandexReviewsConfig', array(
            'apiUrl' => $this->api_url,
            'yandexUrl' => $this->yandex_url
        ));
    }
    
    public function render_widget($atts) {
        $atts = shortcode_atts(array(
            'title' => 'Отзывы пациентов Стоматологической клиники "ЛЕГЕНДА"',
            'org_url' => $this->yandex_url
        ), $atts);
        
        ob_start();
        ?>
        <div class="yandex-reviews-widget" data-org-url="<?php echo esc_attr($atts['org_url']); ?>">
            <div class="yrw-container">
                <div class="yrw-header">
                    <h2 class="yrw-title"><?php echo esc_html($atts['title']); ?></h2>
                    <div class="yrw-rating-info">
                        <div class="yrw-stars" id="yrw-stars"></div>
                        <span class="yrw-rating-value" id="yrw-rating-value">5.0</span>
                        <span class="yrw-reviews-count" id="yrw-reviews-count">(0 отзывов)</span>
                    </div>
                </div>
                
                <div class="yrw-loading" id="yrw-loading">
                    <div class="yrw-spinner"></div>
                    <p>Загружаем отзывы...</p>
                </div>
                
                <div class="yrw-content" id="yrw-content" style="display: none;">
                    <div class="yrw-reviews-grid" id="yrw-reviews-grid"></div>
                    
                    <div class="yrw-navigation">
                        <button class="yrw-nav-btn yrw-prev" id="yrw-prev">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                        </button>
                        
                        <div class="yrw-dots" id="yrw-dots"></div>
                        
                        <button class="yrw-nav-btn yrw-next" id="yrw-next">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    public function register_widget() {
        register_widget('Yandex_Reviews_WP_Widget');
    }
}

class Yandex_Reviews_WP_Widget extends WP_Widget {
    
    public function __construct() {
        parent::__construct(
            'yandex_reviews_widget',
            'Отзывы Яндекс.Карты',
            array('description' => 'Виджет отзывов с Яндекс.Карт')
        );
    }
    
    public function widget($args, $instance) {
        echo $args['before_widget'];
        
        $title = !empty($instance['title']) ? $instance['title'] : 'Отзывы пациентов';
        $org_url = !empty($instance['org_url']) ? $instance['org_url'] : 'https://yandex.ru/maps/org/legenda/88154393306/';
        
        echo do_shortcode('[yandex_reviews title="' . esc_attr($title) . '" org_url="' . esc_attr($org_url) . '"]');
        
        echo $args['after_widget'];
    }
    
    public function form($instance) {
        $title = !empty($instance['title']) ? $instance['title'] : 'Отзывы пациентов';
        $org_url = !empty($instance['org_url']) ? $instance['org_url'] : 'https://yandex.ru/maps/org/legenda/88154393306/';
        ?>
        <p>
            <label for="<?php echo esc_attr($this->get_field_id('title')); ?>">Заголовок:</label>
            <input class="widefat" id="<?php echo esc_attr($this->get_field_id('title')); ?>" 
                   name="<?php echo esc_attr($this->get_field_name('title')); ?>" 
                   type="text" value="<?php echo esc_attr($title); ?>">
        </p>
        <p>
            <label for="<?php echo esc_attr($this->get_field_id('org_url')); ?>">URL организации на Яндекс.Картах:</label>
            <input class="widefat" id="<?php echo esc_attr($this->get_field_id('org_url')); ?>" 
                   name="<?php echo esc_attr($this->get_field_name('org_url')); ?>" 
                   type="text" value="<?php echo esc_attr($org_url); ?>">
        </p>
        <?php
    }
    
    public function update($new_instance, $old_instance) {
        $instance = array();
        $instance['title'] = (!empty($new_instance['title'])) ? strip_tags($new_instance['title']) : '';
        $instance['org_url'] = (!empty($new_instance['org_url'])) ? esc_url_raw($new_instance['org_url']) : '';
        return $instance;
    }
}

new Yandex_Reviews_Widget();
