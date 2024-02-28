<?php
/**
 * This file will create Custom Rest API End Points.
 */
class WP_React_Settings_Rest_Route {

    public function __construct() {
        add_action( 'rest_api_init', [ $this, 'create_rest_routes' ] );
    }

    public function create_rest_routes() {
        /**
         * feat: gestion des routes personnalisé pour les produits
         */
        register_rest_route('hqfastservice/v1', '/products/', array(
            'methods' => 'GET',
            'callback' => [$this, 'get_products'],
            'permission_callback' => [ $this, 'get_data_permission' ]
        ));

        register_rest_route('hqfastservice/v1', '/change-status-product/', array(
            'methods' => 'POST',
            'callback' => [$this, 'change_status_product'],
            'permission_callback' => [ $this, 'get_data_permission' ]
        ));

        register_rest_route('hqfastservice/v1', '/create-products/', array(
            'methods' => 'POST',
            'callback' => [$this, 'create_products'],
            'permission_callback' => [ $this, 'get_data_permission' ]
        ));

        /**
         * feat: gestion des routes personnalisé pour les commandes
         * todo: configuration de get_data_permission 
         */
        register_rest_route('hqfastservice/v1', '/commande/', array(
            'methods' => 'GET',
            'callback' => [$this, 'get_commandes'],
            'permission_callback' => [ $this, 'get_data_permission' ]
        ));
        register_rest_route('hqfastservice/v1', '/change-status-commande/', array(
            'methods' => 'POST',
            'callback' => [$this, 'change_status_commande'],
            'permission_callback' => [ $this, 'get_data_permission' ]
        ));
    }

    public function change_status_product($data) {
        $idProduct = $data['productId'];
        $args           = array(
			'ID'      => $idProduct,
            'post_status' => 'publish'
		);

        if (wp_update_post($args)) {
            http_response_code(200); // OK
            return 'Product status changed successfully.';
        } else {
            http_response_code(500); // Internal Server Error
            return 'Failed to change product status.';
        }
    }

    public function create_products($data) {
        ini_set('memory_limit', '256M');
        // $newData = json_decode($data, true); // Convertir les données JSON en tableau PHP

        // // Vérifier si des données ont été reçues
        if (empty($data['data'])) {
            return 'Aucune donnée à traiter.';
        }
    
        // Parcourir chaque produit et l'insérer dans le CPT
        foreach ($data['data'] as $product) {
            $wordpress_post = array(
                'post_title' => $product['title'],
                'post_content' => $product['overview'],
                'post_status' => 'draft',
                'post_author' => 1,
                'post_type' => 'products'
            );
    
            $post_id = wp_insert_post($wordpress_post);
            
            if ($post_id) {
                // Télécharger et attacher l'image du poster au média de WordPress
                $imageUrl = "https://image.tmdb.org/t/p/w500".$product['poster_path'];
                $mediaDatas = explode('.', $imageUrl);
                $extension =  strtolower(end($mediaDatas));
                $imagePath = (wp_get_upload_dir()['path']) . '/' . basename($imageUrl);
                if (copy($imageUrl, $imagePath)) {
                    $imageInfo  = getimagesize($imagePath);
                    $mimeType   = 'image/jpeg';
                    if ($imageInfo !== false) {
                        $mimeType = $imageInfo['mime'];
                    }
                    // Ajoutez l'image au produit
                    $attachmentId = \wp_insert_attachment(array(
                        'post_mime_type' => $mimeType,
                        'post_title'     => basename($imagePath),
                        'post_status'    => 'inherit'
                    ), $imagePath);
                    // Associez l'image au produit
                    if (!\is_wp_error($attachmentId)) {
                        set_post_thumbnail($post_id, $attachmentId);
                    }

                }

                $vote_average = $product['vote_average'];

                // Multipliez par 10
                $percentage = $vote_average * 10;

                // Arrondissez à l'entier le plus proche
                $rounded_percentage = round($percentage);

                update_field('date_de_sortie', $product['release_date'], $post_id);
                update_field('rating', $rounded_percentage, $post_id);
                
            } else {
                return false;
            }
        }
        
        return $data;
    }

    public function get_products() {
        $args           = array(
			'post_type'      => 'products',
			'posts_per_page' => -1,
            'post_status' => 'draft'
		);
        $requests_query = new WP_Query( $args );

        return rest_ensure_response( $requests_query->posts );
    }


    public function get_data_permission() {
        return true;
    }

    public function save_settings_permission() {
        return current_user_can( 'publish_posts' );
    }

    public function get_commandes() {
        $args           = array(
			'post_type'      => 'commande',
			'posts_per_page' => -1,
            'post_status' => 'draft'
		);
        $posts = get_posts( $args );
        foreach ($posts as $key => $post) {
            $productIds = get_field('produits',$post->ID);
            $args           = array(
                'post_type'      => 'products',
                'posts_per_page' => 4,
                'post__in' => $productIds
            );
            $posts[$key]->products = get_posts( $args );
        }
        return rest_ensure_response( $posts );
    }

    public function change_status_commande($data) {
        $idCommande = $data['idCommande'];
        $args           = array(
			'ID'      => $idCommande,
            'post_status' => 'publish',
            'post_type' => 'commande'
		);
        if (wp_update_post($args)) {
            http_response_code(200); // OK
            return 'Product status changed successfully.';
        } else {
            http_response_code(500); // Internal Server Error
            return 'Failed to change product status.';
        }
    }
}
new WP_React_Settings_Rest_Route();