<?php
/**
 * This file will create Custom Rest API End Points.
 */
class WP_React_Settings_Rest_Route
{
    public function __construct()
    {
        add_action('rest_api_init', [$this, 'create_rest_routes']);
    }

    public function create_rest_routes()
    {
        /**
         * feat: gestion des routes personnalisé pour les produits
         */
        register_rest_route('hqfastservice/v1', '/products/', [
            'methods' => 'GET',
            'callback' => [$this, 'get_products'],
            'permission_callback' => [$this, 'get_data_permission'],
        ]);

        register_rest_route('hqfastservice/v1', '/change-status-product/', [
            'methods' => 'POST',
            'callback' => [$this, 'change_status_product'],
            'permission_callback' => [$this, 'get_data_permission'],
        ]);

        register_rest_route('hqfastservice/v1', '/create-products/', [
            'methods' => 'POST',
            'callback' => [$this, 'create_products'],
            'permission_callback' => [$this, 'get_data_permission'],
        ]);

        /**
         * feat: gestion des routes personnalisé pour les commandes
         * todo: configuration de get_data_permission
         */
        register_rest_route('hqfastservice/v1', '/commande/', [
            'methods' => 'GET',
            'callback' => [$this, 'get_commandes'],
            'permission_callback' => [$this, 'get_data_permission'],
        ]);
        register_rest_route('hqfastservice/v1', '/change-status-commande/', [
            'methods' => 'POST',
            'callback' => [$this, 'change_status_commande'],
            'permission_callback' => [$this, 'get_data_permission'],
        ]);
    }

    public function change_status_product($data)
    {
        $idProduct = $data['productId'];
        $args = [
            'ID' => $idProduct,
            'post_status' => 'publish',
        ];

        if (wp_update_post($args)) {
            http_response_code(200); // OK
            return 'Product status changed successfully.';
        } else {
            http_response_code(500); // Internal Server Error
            return 'Failed to change product status.';
        }
    }

    public function create_products($data)
    {
        if (empty($data['data'])) {
            return 'Aucune donnée à traiter.';
        }

        $terms = get_terms([
            'taxonomy' => 'hq_tags',
            'hide_empty' => false,
        ]);

        $product = $data['data'];
        $existing_post = $product['titreApi']
            ? get_page_by_title($product['titreApi'], OBJECT, 'products')
            : get_page_by_title($product['title'], OBJECT, 'products');

        if ($existing_post) {
            return false; // Passer au produit suivant
        }

        $wordpress_post = [
            'post_title' => $product['titreApi']
                ? $product['titreApi']
                : $product['title'],
            'post_content' => $product['overview'] ? $product['overview'] : '',
            'post_status' => 'draft',
            'post_author' => 1,
            'post_type' => 'products',
        ];

        $post_id = wp_insert_post($wordpress_post);

        if ($post_id) {
            $imageUrl = $product['poster_path'];
            $imageFileName = basename($imageUrl);
            $uploadDir = wp_get_upload_dir();
            $imagePath = $uploadDir['path'] . '/' . $imageFileName;
            if (!file_exists($imagePath)) {
                if (copy($imageUrl, $imagePath)) {
                    $imageInfo = getimagesize($imagePath);
                    $mimeType = 'image/jpeg';
                    if ($imageInfo !== false) {
                        $mimeType = $imageInfo['mime'];
                    }
                    // Ajoutez l'image au produit
                    $attachmentId = \wp_insert_attachment(
                        [
                            'post_mime_type' => $mimeType,
                            'post_title' => basename($imagePath),
                            'post_status' => 'inherit',
                        ],
                        $imagePath
                    );
                    // Associez l'image au produit
                    if (!\is_wp_error($attachmentId)) {
                        set_post_thumbnail($post_id, $attachmentId);
                    }
                }
            } else {
                // Si l'image existe déjà, récupérer l'ID de l'image existante
                $existing_attachment = get_posts([
                    'post_type' => 'attachment',
                    'posts_per_page' => 1,
                    'post_status' => 'inherit',
                    'meta_query' => [
                        [
                            'key' => '_wp_attached_file',
                            'value' => str_replace(
                                $uploadDir['basedir'] . '/',
                                '',
                                $imagePath
                            ),
                            'compare' => '=',
                        ],
                    ],
                ]);
                if (!empty($existing_attachment)) {
                    $attachmentId = $existing_attachment[0]->ID;
                    set_post_thumbnail($post_id, $attachmentId);
                }
            }

           

            if ($product['release_date']) {
                update_field('date_de_sortie', $product['release_date'], $post_id);
            }
            if ($product['vote_average']) {
                $vote_average = $product['vote_average']
                    ? $product['vote_average']
                    : 0;

                // Multipliez par 10
                $percentage = $vote_average * 10;

                // Arrondissez à l'entier le plus proche
                $rounded_percentage = round($percentage);
                update_field('rating', $rounded_percentage, $post_id);
            }
            
            if ($product['popularity']) {
                update_field('popularity', $product['popularity'], $post_id);
            }
            if ($product['vote_count']) {
                update_field('vote_count', $product['vote_count'], $post_id);
            }
            if ($product['path']) {
                update_field('path', addslashes($product['path']), $post_id);
            }
            if ($product['original_language']) {
                update_field('original_language', $product['original_language'], $post_id);
            }
            if ($product['size']) {
                update_field('taille', $product['size'], $post_id);
            }
            if ($product['saisons']) {
                $saisons = [];
                foreach ($product['saisons'] as $key => $value) {
                    $saisons[$key]['saison'] = $value['saisonNumber'];
                    $saisons[$key]['path'] =  addslashes($value['saison']);
                    $saisons[$key]['size'] = $value['size'];
                }
                update_field('saisons', $saisons, $post_id);
            }
            
            if ($product['alternative_titles']) {
                update_field(
                    'original_title',
                    implode(' , ', $product['alternative_titles']),
                    $post_id
                );
            }elseif($product['original_title']) {
                update_field(
                    'original_title',
                    $product['original_title'],
                    $post_id
                );
            }

            if ($product['genre_ids']) {
                $term_ids_api = $product['genre_ids']; //via api

                $term_ids = [];
                foreach ($terms as $term) {
                    //maka anlay av ao am wp mifanaraka am api
                    $id_api = get_term_meta($term->term_id, 'id_api', true);

                    if (in_array($id_api, $term_ids_api)) {
                        $term_ids[] = $term->term_id;
                    }
                }
                // Ajouter les termes de taxonomie au post
                wp_set_post_terms($post_id, $term_ids, 'hq_tags');
            }
            if ($product['categories'] == 'series') {
                $categories_ids[] = 8;
            } elseif ($product['categories'] == 'films') {
                $categories_ids[] = 7;
            } else {
                // if (in_array(13, $term_ids_api)) {
                    //on force ici la catégorie par série
                    $categories_ids[] = 8;
                // }
            }
            wp_set_post_terms($post_id, $categories_ids, 'category_product');
            $newData = [];
            foreach ($product['actors'] as $key => $value) {
                // Obtention de l'URL de base du dossier de téléversement des médias
                $publicFolder = wp_upload_dir()['baseurl'] . "/acteurs";
                // Concaténation de l'URL de base avec le chemin relatif de l'image
                $imagePath = $publicFolder . $value['profile_path'];
                $newData[$key]['picture'] = $imagePath;
                $newData[$key]['name'] = $value['name'];
                $newData[$key]['actorName'] = $value['actorName'];
                $newData[$key]['department'] = isset($value['department'])
                    ? $value['department']
                    : '';
                $newData[$key]['job'] = isset($value['job'])
                    ? $value['job']
                    : '';
            }
            update_field('acteurs', $newData, $post_id);
            return $product;
        } else {
            return false;
        }
    }

    public function get_products()
    {
        $args = [
            'post_type' => 'products',
            'posts_per_page' => -1,
            'post_status' => 'draft',
        ];
        $requests_query = new WP_Query($args);
        $res = $requests_query->posts;
        $products = [];
        foreach ($res as $key => $item) {
            $products[$key]['id'] = $item->ID;
            $products[$key]['post_title'] = $item->post_title;
            $products[$key]['slug'] = $item->post_name;
            $products[$key]['post_content'] = $item->post_content;
            $products[$key]['post_date'] = $item->post_date;
            $products[$key]['cover'] = get_the_post_thumbnail_url($item->ID);
            $products[$key]['tags'] = wp_get_post_terms($item->ID, 'hq_tags');
            $products[$key]['categories'] = wp_get_post_terms(
                $item->ID,
                'category_product'
            );
        }
        return rest_ensure_response($products);
    }

    public function get_data_permission()
    {
        return true;
    }

    public function save_settings_permission()
    {
        return current_user_can('publish_posts');
    }

    public function get_commandes()
    {
        $args = [
            'post_type' => 'commande',
            'posts_per_page' => -1,
            'post_status' => 'draft, publish',
            'order' => 'DESC',
            'orderBy' => 'date',
        ];
        $posts = get_posts($args);
        foreach ($posts as $key => $post) {
            $productIds = get_field('produits', $post->ID);
            $args = [
                'post_type' => 'products',
                'post__in' => $productIds,
            ];
            $res = get_posts($args);

            $products = [];
            foreach ($res as $key => $item) {
                $products[$key]['id'] = $item->ID;
                $products[$key]['post_title'] = $item->post_title;
                $products[$key]['categories'] = wp_get_post_terms(
                    $item->ID,
                    'category_product'
                );
            }
            $posts[$key]->products = $products;
        }
        return rest_ensure_response($posts);
    }

    public function change_status_commande($data)
    {
        $idCommande = $data['idCommande'];
        $args = [
            'ID' => $idCommande,
            'post_status' => 'publish',
            'post_type' => 'commande',
        ];
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
