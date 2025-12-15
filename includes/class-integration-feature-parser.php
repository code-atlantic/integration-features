<?php
/**
 * Integration Feature Parser
 *
 * Extracts structured feature data from Gutenberg blocks on integration pages.
 * Enables building indexes, API responses, JSON exports, and more.
 *
 * @package PopupMaker
 * @since 1.0.0
 */

namespace PopupMaker\IntegrationFeatures;

/**
 * Parser class for extracting integration feature data from post content.
 */
class Integration_Feature_Parser {

	/**
	 * Block name for feature groups.
	 */
	const GROUP_BLOCK = 'popup-maker/integration-features-group';

	/**
	 * Block name for individual features.
	 */
	const FEATURE_BLOCK = 'popup-maker/integration-feature';

	/**
	 * Parsed features data.
	 *
	 * @var array
	 */
	protected $data = [];

	/**
	 * Raw parsed blocks.
	 *
	 * @var array
	 */
	protected $blocks = [];

	/**
	 * Constructor - optionally parse content immediately.
	 *
	 * @param string|int|null $content Post content string, post ID, or null.
	 */
	public function __construct( $content = null ) {
		if ( null !== $content ) {
			$this->parse( $content );
		}
	}

	/**
	 * Parse post content for integration features.
	 *
	 * @param string|int $content Post content string or post ID.
	 * @return self
	 */
	public function parse( $content ) {
		// Handle post ID.
		if ( is_numeric( $content ) ) {
			$post = get_post( $content );
			if ( ! $post ) {
				return $this;
			}
			$content = $post->post_content;
		}

		// Parse blocks.
		$this->blocks = parse_blocks( $content );

		// Extract feature data.
		$this->data = $this->extract_features( $this->blocks );

		return $this;
	}

	/**
	 * Get parsed feature data.
	 *
	 * @return array Structured feature data.
	 */
	public function get_data() {
		return $this->data;
	}

	/**
	 * Get data as JSON.
	 *
	 * @param int $flags JSON encode flags.
	 * @return string JSON string.
	 */
	public function to_json( $flags = JSON_PRETTY_PRINT ) {
		return wp_json_encode( $this->data, $flags );
	}

	/**
	 * Get all categories with their features.
	 *
	 * @return array Array of categories.
	 */
	public function get_categories() {
		return $this->data['categories'] ?? [];
	}

	/**
	 * Get flat list of all features across all categories.
	 *
	 * @return array Array of features.
	 */
	public function get_all_features() {
		$features = [];
		foreach ( $this->get_categories() as $category ) {
			$features = array_merge( $features, $category['features'] ?? [] );
		}
		return $features;
	}

	/**
	 * Get features filtered by tier.
	 *
	 * @param string $tier Tier to filter by: 'free', 'pro', or 'proplus'.
	 * @return array Array of features matching the tier.
	 */
	public function get_features_by_tier( $tier ) {
		return array_filter(
			$this->get_all_features(),
			function( $feature ) use ( $tier ) {
				return ( $feature['tier'] ?? 'free' ) === $tier;
			}
		);
	}

	/**
	 * Get feature count by tier.
	 *
	 * @return array Associative array of tier => count.
	 */
	public function get_tier_counts() {
		return $this->data['features_by_tier'] ?? [
			'free'    => 0,
			'pro'     => 0,
			'proplus' => 0,
		];
	}

	/**
	 * Get total feature count.
	 *
	 * @return int Total number of features.
	 */
	public function get_total_count() {
		return $this->data['total_features'] ?? 0;
	}

	/**
	 * Get features that have descriptions.
	 *
	 * @return array Array of features with descriptions.
	 */
	public function get_features_with_descriptions() {
		return array_filter(
			$this->get_all_features(),
			function( $feature ) {
				return ! empty( $feature['has_description'] );
			}
		);
	}

	/**
	 * Search features by label.
	 *
	 * @param string $query Search query.
	 * @return array Matching features.
	 */
	public function search_features( $query ) {
		$query = strtolower( $query );
		return array_filter(
			$this->get_all_features(),
			function( $feature ) use ( $query ) {
				return false !== strpos( strtolower( $feature['label'] ?? '' ), $query );
			}
		);
	}

	/**
	 * Extract features from parsed blocks.
	 *
	 * @param array $blocks Parsed blocks array.
	 * @return array Structured feature data.
	 */
	protected function extract_features( $blocks ) {
		$categories      = [];
		$total_features  = 0;
		$features_by_tier = [
			'free'    => 0,
			'pro'     => 0,
			'proplus' => 0,
		];

		// Find all feature groups and standalone features.
		$this->find_feature_blocks( $blocks, $categories, $total_features, $features_by_tier );

		return [
			'categories'       => $categories,
			'total_features'   => $total_features,
			'features_by_tier' => $features_by_tier,
		];
	}

	/**
	 * Recursively find feature blocks in the block tree.
	 *
	 * @param array $blocks          Blocks to search.
	 * @param array $categories      Reference to categories array.
	 * @param int   $total_features  Reference to total features count.
	 * @param array $features_by_tier Reference to tier counts array.
	 */
	protected function find_feature_blocks( $blocks, &$categories, &$total_features, &$features_by_tier ) {
		foreach ( $blocks as $block ) {
			if ( empty( $block['blockName'] ) ) {
				continue;
			}

			if ( self::GROUP_BLOCK === $block['blockName'] ) {
				// Process feature group.
				$category = $this->parse_feature_group( $block, $total_features, $features_by_tier );
				if ( ! empty( $category ) ) {
					$categories[] = $category;
				}
			} elseif ( self::FEATURE_BLOCK === $block['blockName'] ) {
				// Standalone feature (not in a group).
				$feature = $this->parse_feature( $block );
				if ( ! empty( $feature ) ) {
					// Add to uncategorized group.
					$uncategorized_key = $this->find_or_create_uncategorized( $categories );
					$categories[ $uncategorized_key ]['features'][] = $feature;

					$total_features++;
					$tier = $feature['tier'] ?? 'free';
					if ( isset( $features_by_tier[ $tier ] ) ) {
						$features_by_tier[ $tier ]++;
					}
				}
			} elseif ( ! empty( $block['innerBlocks'] ) ) {
				// Recursively search inner blocks.
				$this->find_feature_blocks( $block['innerBlocks'], $categories, $total_features, $features_by_tier );
			}
		}
	}

	/**
	 * Find or create an "Uncategorized" group for standalone features.
	 *
	 * @param array $categories Reference to categories array.
	 * @return int Index of the uncategorized category.
	 */
	protected function find_or_create_uncategorized( &$categories ) {
		foreach ( $categories as $index => $category ) {
			if ( '__uncategorized__' === ( $category['id'] ?? '' ) ) {
				return $index;
			}
		}

		// Create new uncategorized group.
		$categories[] = [
			'id'         => '__uncategorized__',
			'heading'    => 'Features',
			'subheading' => '',
			'icon'       => 'admin-plugins',
			'features'   => [],
		];

		return count( $categories ) - 1;
	}

	/**
	 * Parse a feature group block.
	 *
	 * @param array $block           The group block.
	 * @param int   $total_features  Reference to total features count.
	 * @param array $features_by_tier Reference to tier counts array.
	 * @return array Parsed category data.
	 */
	protected function parse_feature_group( $block, &$total_features, &$features_by_tier ) {
		$attrs = $block['attrs'] ?? [];

		$category = [
			'heading'           => $attrs['heading'] ?? '',
			'subheading'        => $attrs['subheading'] ?? '',
			'icon'              => $attrs['groupIcon'] ?? 'admin-plugins',
			'icon_color'        => $attrs['groupIconColor'] ?? '',
			'icon_bg_color'     => $attrs['groupIconBackgroundColor'] ?? '',
			'heading_tag'       => $attrs['headingTag'] ?? 'h2',
			'show_feature_count' => $attrs['showFeatureCount'] ?? false,
			'feature_count'     => $attrs['featureCount'] ?? 0,
			'features'          => [],
		];

		// Parse inner feature blocks.
		if ( ! empty( $block['innerBlocks'] ) ) {
			foreach ( $block['innerBlocks'] as $inner_block ) {
				if ( self::FEATURE_BLOCK === $inner_block['blockName'] ) {
					$feature = $this->parse_feature( $inner_block );
					if ( ! empty( $feature ) ) {
						$category['features'][] = $feature;

						$total_features++;
						$tier = $feature['tier'] ?? 'free';
						if ( isset( $features_by_tier[ $tier ] ) ) {
							$features_by_tier[ $tier ]++;
						}
					}
				}
			}
		}

		return $category;
	}

	/**
	 * Parse an individual feature block.
	 *
	 * @param array $block The feature block.
	 * @return array Parsed feature data.
	 */
	protected function parse_feature( $block ) {
		$attrs = $block['attrs'] ?? [];

		// Extract label from HTML content.
		$label = $this->extract_label( $block );

		// Extract description from inner blocks.
		$description = $this->extract_description( $block );

		return [
			'label'           => $label,
			'tier'            => $attrs['tier'] ?? 'free',
			'has_description' => ! empty( $attrs['hasDescription'] ) || ! empty( $description ),
			'description'     => $description,
			'show_free_badge' => $attrs['showFreeBadge'] ?? false,
			'icon_style'      => $attrs['iconStyle'] ?? 'plus-minus',
		];
	}

	/**
	 * Extract label text from feature block HTML.
	 *
	 * The label is stored as RichText in the .pm-integration-feature__label selector.
	 *
	 * @param array $block The feature block.
	 * @return string Extracted label text.
	 */
	protected function extract_label( $block ) {
		// First try from attrs (if saved there).
		if ( ! empty( $block['attrs']['label'] ) ) {
			return wp_strip_all_tags( $block['attrs']['label'] );
		}

		// Otherwise extract from innerHTML.
		$html = $block['innerHTML'] ?? '';
		if ( empty( $html ) ) {
			$html = implode( '', array_filter( $block['innerContent'] ?? [], 'is_string' ) );
		}

		// Match the label span.
		if ( preg_match( '/<span[^>]*class="[^"]*pm-integration-feature__label[^"]*"[^>]*>(.*?)<\/span>/s', $html, $matches ) ) {
			return wp_strip_all_tags( $matches[1] );
		}

		return '';
	}

	/**
	 * Extract description content from feature inner blocks.
	 *
	 * @param array $block The feature block.
	 * @return string Extracted description (HTML or plain text).
	 */
	protected function extract_description( $block ) {
		if ( empty( $block['innerBlocks'] ) ) {
			return '';
		}

		$description_parts = [];

		foreach ( $block['innerBlocks'] as $inner_block ) {
			// Render the inner block to get its content.
			$content = $this->render_block_content( $inner_block );
			if ( ! empty( $content ) ) {
				$description_parts[] = $content;
			}
		}

		return implode( "\n", $description_parts );
	}

	/**
	 * Render a block's content to HTML.
	 *
	 * @param array $block The block to render.
	 * @return string Rendered HTML content.
	 */
	protected function render_block_content( $block ) {
		// Use innerHTML if available.
		if ( ! empty( $block['innerHTML'] ) ) {
			return trim( $block['innerHTML'] );
		}

		// Otherwise build from innerContent.
		if ( ! empty( $block['innerContent'] ) ) {
			return trim( implode( '', array_filter( $block['innerContent'], 'is_string' ) ) );
		}

		return '';
	}

	/**
	 * Get summary statistics for the integration page.
	 *
	 * @return array Summary statistics.
	 */
	public function get_summary() {
		$categories     = $this->get_categories();
		$all_features   = $this->get_all_features();
		$with_desc      = $this->get_features_with_descriptions();
		$tier_counts    = $this->get_tier_counts();

		return [
			'total_categories'         => count( $categories ),
			'total_features'           => count( $all_features ),
			'features_with_descriptions' => count( $with_desc ),
			'features_by_tier'         => $tier_counts,
			'category_names'           => array_column( $categories, 'heading' ),
		];
	}

	/**
	 * Export features to a simplified format for API responses.
	 *
	 * @param bool $include_descriptions Whether to include description HTML.
	 * @return array API-friendly feature array.
	 */
	public function to_api_format( $include_descriptions = false ) {
		$output = [];

		foreach ( $this->get_categories() as $category ) {
			$cat_data = [
				'name'     => $category['heading'],
				'icon'     => $category['icon'],
				'features' => [],
			];

			foreach ( $category['features'] ?? [] as $feature ) {
				$feat_data = [
					'label' => $feature['label'],
					'tier'  => $feature['tier'],
				];

				if ( $include_descriptions && ! empty( $feature['description'] ) ) {
					$feat_data['description'] = $feature['description'];
				}

				$cat_data['features'][] = $feat_data;
			}

			$output[] = $cat_data;
		}

		return $output;
	}
}

/**
 * Helper function to quickly parse an integration post.
 *
 * @param int|string|\WP_Post $post Post ID, content, or post object.
 * @return Integration_Feature_Parser Parser instance with parsed data.
 */
function parse_integration_features( $post ) {
	if ( $post instanceof \WP_Post ) {
		$content = $post->post_content;
	} elseif ( is_numeric( $post ) ) {
		$content = $post; // Will be handled by parser.
	} else {
		$content = $post;
	}

	return new Integration_Feature_Parser( $content );
}

/**
 * Get all integration posts with their parsed feature data.
 *
 * @param array $args Optional WP_Query args.
 * @return array Array of posts with 'post' and 'features' keys.
 */
function get_all_integration_features( $args = [] ) {
	$defaults = [
		'post_type'      => 'integration',
		'posts_per_page' => -1,
		'post_status'    => 'publish',
	];

	$args  = wp_parse_args( $args, $defaults );
	$query = new \WP_Query( $args );

	$results = [];

	foreach ( $query->posts as $post ) {
		$parser    = new Integration_Feature_Parser( $post->post_content );
		$results[] = [
			'post'     => $post,
			'features' => $parser->get_data(),
			'summary'  => $parser->get_summary(),
		];
	}

	return $results;
}

/**
 * Build a master index of all features across all integrations.
 *
 * @return array Master index with all features organized by integration.
 */
function build_integration_features_index() {
	$all_integrations = get_all_integration_features();

	$index = [
		'integrations'   => [],
		'total_features' => 0,
		'all_features'   => [],
		'by_tier'        => [
			'free'    => [],
			'pro'     => [],
			'proplus' => [],
		],
	];

	foreach ( $all_integrations as $integration ) {
		$post   = $integration['post'];
		$parser = new Integration_Feature_Parser( $post->post_content );

		$int_data = [
			'id'        => $post->ID,
			'title'     => $post->post_title,
			'slug'      => $post->post_name,
			'url'       => get_permalink( $post->ID ),
			'summary'   => $parser->get_summary(),
			'features'  => $parser->to_api_format( true ),
		];

		$index['integrations'][] = $int_data;

		// Aggregate all features.
		foreach ( $parser->get_all_features() as $feature ) {
			$feature['integration_id']    = $post->ID;
			$feature['integration_title'] = $post->post_title;

			$index['all_features'][] = $feature;
			$index['total_features']++;

			$tier = $feature['tier'] ?? 'free';
			if ( isset( $index['by_tier'][ $tier ] ) ) {
				$index['by_tier'][ $tier ][] = $feature;
			}
		}
	}

	return $index;
}
