<?php
/**
 * Plugin Name: Yandex Reviews Widget - Легенда
 * Plugin URI: https://preview--yandex-review-widget.poehali.dev/
 * Description: Виджет отзывов с Яндекс.Карт с гибкими настройками дизайна и фильтрации
 * Version: 2.0.0
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
    private $option_name = 'yrw_settings';
    
    public function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
        add_shortcode('yandex_reviews', array($this, 'render_widget'));
        add_action('widgets_init', array($this, 'register_widget'));
    }
    
    public function add_admin_menu() {
        add_menu_page(
            'Yandex Reviews Widget',
            'Отзывы Яндекс',
            'manage_options',
            'yandex-reviews-widget',
            array($this, 'render_admin_page'),
            'dashicons-star-filled',
            30
        );
    }
    
    public function register_settings() {
        register_setting($this->option_name, $this->option_name, array($this, 'sanitize_settings'));
        
        add_settings_section(
            'yrw_general_section',
            'Основные настройки',
            null,
            'yandex-reviews-widget'
        );
        
        add_settings_section(
            'yrw_design_section',
            'Настройки дизайна',
            null,
            'yandex-reviews-widget'
        );
        
        add_settings_section(
            'yrw_filters_section',
            'Фильтры и сортировка',
            null,
            'yandex-reviews-widget'
        );
    }
    
    public function sanitize_settings($input) {
        $sanitized = array();
        
        if (isset($input['org_url'])) {
            $sanitized['org_url'] = esc_url_raw($input['org_url']);
        }
        
        if (isset($input['layout'])) {
            $sanitized['layout'] = sanitize_text_field($input['layout']);
        }
        
        if (isset($input['primary_color'])) {
            $sanitized['primary_color'] = sanitize_hex_color($input['primary_color']);
        }
        
        if (isset($input['accent_color'])) {
            $sanitized['accent_color'] = sanitize_hex_color($input['accent_color']);
        }
        
        if (isset($input['text_color'])) {
            $sanitized['text_color'] = sanitize_hex_color($input['text_color']);
        }
        
        if (isset($input['show_filters'])) {
            $sanitized['show_filters'] = (bool) $input['show_filters'];
        }
        
        if (isset($input['default_sort'])) {
            $sanitized['default_sort'] = sanitize_text_field($input['default_sort']);
        }
        
        return $sanitized;
    }
    
    public function get_settings() {
        $defaults = array(
            'org_url' => 'https://yandex.ru/maps/org/legenda/88154393306/',
            'layout' => '3-column',
            'primary_color' => '#5b5b5b',
            'accent_color' => '#050505',
            'text_color' => '#050505',
            'show_filters' => true,
            'default_sort' => 'date'
        );
        
        $settings = get_option($this->option_name, $defaults);
        return wp_parse_args($settings, $defaults);
    }
    
    public function render_admin_page() {
        ?>
        <div class="wrap">
            <h1>Настройки Yandex Reviews Widget</h1>
            
            <form method="post" action="options.php">
                <?php
                settings_fields($this->option_name);
                $settings = $this->get_settings();
                ?>
                
                <table class="form-table">
                    <tr>
                        <th colspan="2"><h2>Основные настройки</h2></th>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="org_url">URL организации на Яндекс.Картах</label>
                        </th>
                        <td>
                            <input type="url" id="org_url" name="<?php echo $this->option_name; ?>[org_url]" 
                                   value="<?php echo esc_attr($settings['org_url']); ?>" class="regular-text">
                            <p class="description">Например: https://yandex.ru/maps/org/your-org/12345/</p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th colspan="2"><h2>Настройки дизайна</h2></th>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="layout">Макет виджета</label>
                        </th>
                        <td>
                            <select id="layout" name="<?php echo $this->option_name; ?>[layout]">
                                <option value="1-column" <?php selected($settings['layout'], '1-column'); ?>>1 колонка</option>
                                <option value="2-column" <?php selected($settings['layout'], '2-column'); ?>>2 колонки</option>
                                <option value="3-column" <?php selected($settings['layout'], '3-column'); ?>>3 колонки</option>
                                <option value="slider" <?php selected($settings['layout'], 'slider'); ?>>Слайдер (3 отзыва)</option>
                            </select>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="primary_color">Основной цвет</label>
                        </th>
                        <td>
                            <input type="color" id="primary_color" name="<?php echo $this->option_name; ?>[primary_color]" 
                                   value="<?php echo esc_attr($settings['primary_color']); ?>">
                            <p class="description">Используется для иконок и акцентов</p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="accent_color">Цвет акцента</label>
                        </th>
                        <td>
                            <input type="color" id="accent_color" name="<?php echo $this->option_name; ?>[accent_color]" 
                                   value="<?php echo esc_attr($settings['accent_color']); ?>">
                            <p class="description">Используется для кнопок и важных элементов</p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="text_color">Цвет текста</label>
                        </th>
                        <td>
                            <input type="color" id="text_color" name="<?php echo $this->option_name; ?>[text_color]" 
                                   value="<?php echo esc_attr($settings['text_color']); ?>">
                        </td>
                    </tr>
                    
                    <tr>
                        <th colspan="2"><h2>Фильтры и сортировка</h2></th>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="show_filters">Показывать фильтры</label>
                        </th>
                        <td>
                            <input type="checkbox" id="show_filters" name="<?php echo $this->option_name; ?>[show_filters]" 
                                   value="1" <?php checked($settings['show_filters'], true); ?>>
                            <p class="description">Позволяет пользователям фильтровать отзывы по рейтингу и дате</p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="default_sort">Сортировка по умолчанию</label>
                        </th>
                        <td>
                            <select id="default_sort" name="<?php echo $this->option_name; ?>[default_sort]">
                                <option value="date" <?php selected($settings['default_sort'], 'date'); ?>>По дате (сначала новые)</option>
                                <option value="rating" <?php selected($settings['default_sort'], 'rating'); ?>>По рейтингу (сначала высокие)</option>
                            </select>
                        </td>
                    </tr>
                </table>
                
                <?php submit_button('Сохранить настройки'); ?>
            </form>
            
            <div class="card" style="max-width: 800px; margin-top: 30px;">
                <h2>Как использовать виджет</h2>
                <h3>1. Через шорткод</h3>
                <p>Вставьте в любой пост или страницу:</p>
                <code>[yandex_reviews]</code>
                
                <h3>2. В коде темы (PHP)</h3>
                <pre>&lt;?php echo do_shortcode('[yandex_reviews]'); ?&gt;</pre>
                
                <h3>3. Через виджеты WordPress</h3>
                <p>Внешний вид → Виджеты → "Отзывы Яндекс.Карты"</p>
            </div>
        </div>
        <?php
    }
    
    public function enqueue_admin_scripts($hook) {
        if ($hook !== 'toplevel_page_yandex-reviews-widget') {
            return;
        }
        
        wp_enqueue_style('wp-color-picker');
        wp_enqueue_script('wp-color-picker');
    }
    
    public function enqueue_scripts() {
        $settings = $this->get_settings();
        
        wp_enqueue_style(
            'yandex-reviews-widget-style',
            plugins_url('assets/style.css', __FILE__),
            array(),
            '2.0.0'
        );
        
        $custom_css = "
            .yandex-reviews-widget {
                --yrw-primary-color: {$settings['primary_color']};
                --yrw-accent-color: {$settings['accent_color']};
                --yrw-text-color: {$settings['text_color']};
            }
        ";
        wp_add_inline_style('yandex-reviews-widget-style', $custom_css);
        
        wp_enqueue_script(
            'yandex-reviews-widget-script',
            plugins_url('assets/script.js', __FILE__),
            array(),
            '2.0.0',
            true
        );
        
        wp_localize_script('yandex-reviews-widget-script', 'yandexReviewsConfig', array(
            'apiUrl' => $this->api_url,
            'yandexUrl' => $settings['org_url'],
            'layout' => $settings['layout'],
            'showFilters' => $settings['show_filters'],
            'defaultSort' => $settings['default_sort']
        ));
    }
    
    public function render_widget($atts) {
        $settings = $this->get_settings();
        
        $atts = shortcode_atts(array(
            'title' => 'Отзывы пациентов Стоматологической клиники "ЛЕГЕНДА"',
            'org_url' => $settings['org_url'],
            'layout' => $settings['layout'],
            'show_filters' => $settings['show_filters']
        ), $atts);
        
        ob_start();
        ?>
        <div class="yandex-reviews-widget" 
             data-org-url="<?php echo esc_attr($atts['org_url']); ?>"
             data-layout="<?php echo esc_attr($atts['layout']); ?>"
             data-show-filters="<?php echo $atts['show_filters'] ? '1' : '0'; ?>">
            <div class="yrw-container">
                <div class="yrw-header">
                    <h2 class="yrw-title"><?php echo esc_html($atts['title']); ?></h2>
                    <div class="yrw-rating-info">
                        <div class="yrw-stars" id="yrw-stars"></div>
                        <span class="yrw-rating-value" id="yrw-rating-value">5.0</span>
                        <span class="yrw-reviews-count" id="yrw-reviews-count">(0 отзывов)</span>
                    </div>
                </div>
                
                <?php if ($atts['show_filters']) : ?>
                <div class="yrw-filters" id="yrw-filters" style="display: none;">
                    <div class="yrw-filter-group">
                        <label>Рейтинг:</label>
                        <button class="yrw-filter-btn active" data-rating="all">Все</button>
                        <button class="yrw-filter-btn" data-rating="5">5 ⭐</button>
                        <button class="yrw-filter-btn" data-rating="4">4 ⭐</button>
                        <button class="yrw-filter-btn" data-rating="3">3 ⭐</button>
                    </div>
                    <div class="yrw-filter-group">
                        <label>Сортировка:</label>
                        <select class="yrw-sort-select" id="yrw-sort">
                            <option value="date">По дате (новые)</option>
                            <option value="rating">По рейтингу</option>
                        </select>
                    </div>
                </div>
                <?php endif; ?>
                
                <div class="yrw-loading" id="yrw-loading">
                    <div class="yrw-spinner"></div>
                    <p>Загружаем отзывы...</p>
                </div>
                
                <div class="yrw-content" id="yrw-content" style="display: none;">
                    <div class="yrw-reviews-grid" id="yrw-reviews-grid"></div>
                    
                    <div class="yrw-navigation" id="yrw-navigation">
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
        
        echo do_shortcode('[yandex_reviews title="' . esc_attr($title) . '"]');
        
        echo $args['after_widget'];
    }
    
    public function form($instance) {
        $title = !empty($instance['title']) ? $instance['title'] : 'Отзывы пациентов';
        ?>
        <p>
            <label for="<?php echo esc_attr($this->get_field_id('title')); ?>">Заголовок:</label>
            <input class="widefat" id="<?php echo esc_attr($this->get_field_id('title')); ?>" 
                   name="<?php echo esc_attr($this->get_field_name('title')); ?>" 
                   type="text" value="<?php echo esc_attr($title); ?>">
        </p>
        <p class="description">Остальные настройки можно изменить в разделе "Отзывы Яндекс" в главном меню.</p>
        <?php
    }
    
    public function update($new_instance, $old_instance) {
        $instance = array();
        $instance['title'] = (!empty($new_instance['title'])) ? strip_tags($new_instance['title']) : '';
        return $instance;
    }
}

new Yandex_Reviews_Widget();
