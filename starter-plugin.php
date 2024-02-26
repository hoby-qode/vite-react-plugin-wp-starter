<?php
/**
 * Plugin Name: Starter plugin
 * Author: Hoby Qode
 * Version: 1.0.0
 * Description: Plugin pour le site fast service.
 * Text-Domain: hq-fast-service
 */

if( ! defined( 'ABSPATH' ) ) : exit(); endif; // No direct access allowed.

/**
* Define Plugins Contants
*/
define ( 'PATH', trailingslashit( plugin_dir_path( __FILE__ ) ) );
define ( 'URL', trailingslashit( plugins_url( '/', __FILE__ ) ) );

require_once PATH . 'includes/admin/class-create-admin-menu.php';
require_once PATH . 'includes/admin/class-create-settings-routes.php';