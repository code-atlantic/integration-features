<?php
/**
 * Integration Features REST API
 *
 * Exposes parsed integration feature data via the WordPress REST API.
 *
 * @package PopupMaker
 * @since 1.0.0
 */

namespace PopupMaker\IntegrationFeatures;

/**
 * REST API controller for integration features.
 */
class Integration_Features_REST_API {

	/**
	 * REST namespace.
	 */
	const NAMESPACE = 'popup-maker/v1';

	/**
	 * Register REST routes.
	 */
	public static function register_routes() {
		// Get features for a specific integration post.
		register_rest_route(
			self::NAMESPACE,
			'/integration-features/(?P<id>\d+)',
			[
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => [ __CLASS__, 'get_integration_features' ],
				'permission_callback' => '__return_true',
				'args'                => [
					'id' => [
						'description' => 'Integration post ID',
						'type'        => 'integer',
						'required'    => true,
					],
					'include_descriptions' => [
						'description' => 'Include feature descriptions in response',
						'type'        => 'boolean',
						'default'     => false,
					],
					'format' => [
						'description' => 'Response format: full, api, or summary',
						'type'        => 'string',
						'enum'        => [ 'full', 'api', 'summary' ],
						'default'     => 'full',
					],
				],
			]
		);

		// Get master index of all integration features.
		register_rest_route(
			self::NAMESPACE,
			'/integration-features',
			[
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => [ __CLASS__, 'get_all_integration_features' ],
				'permission_callback' => '__return_true',
				'args'                => [
					'tier' => [
						'description' => 'Filter by tier',
						'type'        => 'string',
						'enum'        => [ 'free', 'pro', 'proplus' ],
					],
					'search' => [
						'description' => 'Search features by label',
						'type'        => 'string',
					],
				],
			]
		);

		// Get features grouped by tier across all integrations.
		register_rest_route(
			self::NAMESPACE,
			'/integration-features/by-tier',
			[
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => [ __CLASS__, 'get_features_by_tier' ],
				'permission_callback' => '__return_true',
			]
		);
	}

	/**
	 * Get features for a specific integration post.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response|\WP_Error Response object.
	 */
	public static function get_integration_features( $request ) {
		$post_id = $request->get_param( 'id' );
		$post    = get_post( $post_id );

		if ( ! $post || 'integration' !== $post->post_type ) {
			return new \WP_Error(
				'not_found',
				'Integration post not found',
				[ 'status' => 404 ]
			);
		}

		$parser = new Integration_Feature_Parser( $post->post_content );
		$format = $request->get_param( 'format' );
		$include_desc = $request->get_param( 'include_descriptions' );

		switch ( $format ) {
			case 'summary':
				$data = $parser->get_summary();
				break;

			case 'api':
				$data = $parser->to_api_format( $include_desc );
				break;

			default:
				$data = $parser->get_data();
				break;
		}

		return rest_ensure_response( [
			'post_id'    => $post_id,
			'post_title' => $post->post_title,
			'post_slug'  => $post->post_name,
			'data'       => $data,
		] );
	}

	/**
	 * Get master index of all integration features.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response Response object.
	 */
	public static function get_all_integration_features( $request ) {
		$index = build_integration_features_index();

		// Apply tier filter.
		$tier = $request->get_param( 'tier' );
		if ( $tier && isset( $index['by_tier'][ $tier ] ) ) {
			$index['filtered_features'] = $index['by_tier'][ $tier ];
		}

		// Apply search filter.
		$search = $request->get_param( 'search' );
		if ( $search ) {
			$search = strtolower( $search );
			$index['search_results'] = array_filter(
				$index['all_features'],
				function( $feature ) use ( $search ) {
					return false !== strpos( strtolower( $feature['label'] ?? '' ), $search );
				}
			);
		}

		return rest_ensure_response( $index );
	}

	/**
	 * Get features organized by tier across all integrations.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response Response object.
	 */
	public static function get_features_by_tier( $request ) {
		$index = build_integration_features_index();

		$by_tier = [
			'free' => [
				'count'    => count( $index['by_tier']['free'] ),
				'features' => array_map(
					function( $f ) {
						return [
							'label'       => $f['label'],
							'integration' => $f['integration_title'],
						];
					},
					$index['by_tier']['free']
				),
			],
			'pro' => [
				'count'    => count( $index['by_tier']['pro'] ),
				'features' => array_map(
					function( $f ) {
						return [
							'label'       => $f['label'],
							'integration' => $f['integration_title'],
						];
					},
					$index['by_tier']['pro']
				),
			],
			'proplus' => [
				'count'    => count( $index['by_tier']['proplus'] ),
				'features' => array_map(
					function( $f ) {
						return [
							'label'       => $f['label'],
							'integration' => $f['integration_title'],
						];
					},
					$index['by_tier']['proplus']
				),
			],
		];

		return rest_ensure_response( $by_tier );
	}
}

// Register routes on init.
add_action( 'rest_api_init', [ Integration_Features_REST_API::class, 'register_routes' ] );
