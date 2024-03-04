<?php
/**
 * The plugin uix-dev-plugin-base
 *
 * @link              uix-dev.vercel.app
 * @since             1.0.0
 *
 * @wordpress-plugin
 * Plugin Name:       Plugin de démarrage UIX DEV
 * Plugin URI:        uix-dev-plugin-base
 * Description:       Plugin de démarrage avec React.js & tailwind & shadcn UI
 * Version:           1.0.0
 * Author:            UIX DEV
 * Author URI:        uix-dev
 * Text Domain:       uix-dev
 * Domain Path:       /languages
 */


if( ! defined( 'ABSPATH' ) ) : exit(); endif; // No direct access allowed.


/**
* Define Plugins Contants
*/

define( 'MEDIALIBS_PLUGIN_BASE_VERSION', '1.0.0' );
define ( 'PATH', trailingslashit( plugin_dir_path( __FILE__ ) ) );
define ( 'URL', trailingslashit( plugins_url( '/', __FILE__ ) ) );

require_once PATH . 'includes/admin/class-create-admin-menu.php';
require_once PATH . 'includes/admin/class-create-settings-routes.php';