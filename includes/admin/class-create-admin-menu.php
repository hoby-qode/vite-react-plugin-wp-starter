<?php
/**
 * This file will create admin menu page.
 */

class Create_Admin_Page {

    public function __construct() {
        add_action( 'admin_menu', [ $this, 'create_admin_menu' ] );
    }

    public function create_admin_menu() {
        $capability = 'manage_options';
        $slug = 'starter';
        add_menu_page(
            __( 'Starter', 'starter' ),
            __( 'Starter', 'starter' ),
            $capability,
            $slug,
            [ $this, 'menu_page' ],
            'dashicons-database-import',
            2
        );
    }

    public function menu_page() {
        include dirname(dirname(__DIR__)) . "/dist/index.html";
    }

}
new Create_Admin_Page();