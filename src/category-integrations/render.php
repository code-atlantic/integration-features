<?php
/**
 * Server-side render for Category Integrations block
 *
 * @package IntegrationFeatures
 *
 * Available variables:
 * @var array    $attributes Block attributes
 * @var string   $content    Block default content
 * @var WP_Block $block      Block instance
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Extract attributes with defaults.
$category_id            = $attributes['categoryId'] ?? 0;
$category_slug          = $attributes['categorySlug'] ?? '';
$display_mode           = $attributes['displayMode'] ?? 'expanded';
$tease_count            = $attributes['teaseCount'] ?? 3;
$group_icon             = $attributes['groupIcon'] ?? '';
$group_icon_color       = $attributes['groupIconColor'] ?? '#1dbe61';
$group_icon_bg_color    = $attributes['groupIconBackgroundColor'] ?? '';
$heading_override       = $attributes['headingOverride'] ?? '';
$heading_tag            = $attributes['headingTag'] ?? 'h2';
$subheading_override    = $attributes['subheadingOverride'] ?? '';
$header_bg_color        = $attributes['headerBackgroundColor'] ?? '';
$heading_color          = $attributes['headingColor'] ?? '';
$subheading_color       = $attributes['subheadingColor'] ?? '';
$auto_exclude_current   = $attributes['autoExcludeCurrent'] ?? true;
$tease_expand_mode      = $attributes['teaseExpandMode'] ?? 'link';

// Icon mapping for categories.
$category_icons = array(
	'form-integrations'           => 'dashicons-feedback',
	'ecommerce-integrations'      => 'dashicons-cart',
	'crm-integrations'            => 'dashicons-id-alt',
	'analytics-integrations'      => 'dashicons-chart-bar',
	'automation-integrations'     => 'dashicons-update',
	'email-marketing-integrations' => 'dashicons-email-alt',
	'lms-integrations'            => 'dashicons-welcome-learn-more',
	'page-builder-integrations'   => 'dashicons-layout',
	'social-integrations'         => 'dashicons-share',
);

// Get category term.
$category = null;
if ( $category_id > 0 ) {
	$category = get_term( $category_id, 'integration_category' );
} elseif ( ! empty( $category_slug ) ) {
	$category = get_term_by( 'slug', $category_slug, 'integration_category' );
}

if ( ! $category || is_wp_error( $category ) ) {
	return; // No category found, don't render block.
}

// Determine icon.
if ( empty( $group_icon ) ) {
	$group_icon = $category_icons[ $category->slug ] ?? 'dashicons-admin-links';
}

// Determine heading and subheading.
$heading    = ! empty( $heading_override ) ? $heading_override : $category->name;
$subheading = ! empty( $subheading_override ) ? $subheading_override : $category->description;

// Query integrations from taxonomy.
$query_args = array(
	'post_type'      => 'integration',
	'posts_per_page' => -1,
	'orderby'        => 'title',
	'order'          => 'ASC',
	'tax_query'      => array(
		array(
			'taxonomy' => 'integration_category',
			'field'    => 'term_id',
			'terms'    => $category->term_id,
		),
	),
);

// Auto-exclude current integration on single pages.
if ( $auto_exclude_current && is_singular( 'integration' ) ) {
	$query_args['post__not_in'] = array( get_the_ID() );
}

$integrations = new WP_Query( $query_args );

if ( ! $integrations->have_posts() ) {
	wp_reset_postdata();
	return; // No integrations found, don't render block.
}

$total_count = $integrations->post_count;

// Determine wrapper classes.
// Include pm-integration-features-group for theme compatibility (site styles target this class).
$wrapper_classes = array( 'pm-category-integrations', 'pm-integration-features-group', 'has-features' );
if ( 'collapsed' === $display_mode ) {
	$wrapper_classes[] = 'is-collapsed';
}

// Get block wrapper attributes.
$wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class'               => implode( ' ', $wrapper_classes ),
		'data-display-mode'   => $display_mode,
		'data-wp-interactive' => 'popup-maker/category-integrations',
		'data-wp-context'     => wp_json_encode(
			array(
				'displayMode' => $display_mode,
				'teaseCount'  => $tease_count,
				'isExpanded'  => 'expanded' === $display_mode,
				'totalCount'  => $total_count,
			)
		),
		'data-wp-init'        => 'callbacks.init',
	)
);

// Extract padding from wrapper style for header/content.
$block_style = $block->parsed_block['attrs']['style'] ?? array();
$padding     = $block_style['spacing']['padding'] ?? array();

$padding_styles = '';
if ( ! empty( $padding ) ) {
	if ( isset( $padding['top'] ) ) {
		$padding_styles .= 'padding-top: ' . $padding['top'] . '; ';
	}
	if ( isset( $padding['right'] ) ) {
		$padding_styles .= 'padding-right: ' . $padding['right'] . '; ';
	}
	if ( isset( $padding['bottom'] ) ) {
		$padding_styles .= 'padding-bottom: ' . $padding['bottom'] . '; ';
	}
	if ( isset( $padding['left'] ) ) {
		$padding_styles .= 'padding-left: ' . $padding['left'] . '; ';
	}
}

// Default padding if not set.
if ( empty( $padding_styles ) ) {
	$padding_styles = 'padding: 2rem; ';
}

// Header styles.
$header_styles = $padding_styles;
if ( ! empty( $header_bg_color ) ) {
	$header_styles .= 'background-color: ' . esc_attr( $header_bg_color ) . '; ';
}

// Icon background color (default to 20% opacity of icon color).
$icon_bg = ! empty( $group_icon_bg_color ) ? $group_icon_bg_color : $group_icon_color . '33';

?>
<div <?php echo $wrapper_attributes; ?>>

	<!-- Header: Icon + Heading + Subheading -->
	<div
		class="pm-category-integrations__header pm-integration-features-group__header"
		style="<?php echo esc_attr( $header_styles ); ?>"
		<?php if ( 'collapsed' === $display_mode ) : ?>
			role="button"
			tabindex="0"
			data-wp-on--click="actions.toggleExpand"
			data-wp-on--keydown="actions.handleKeydown"
		<?php endif; ?>
	>

		<!-- Group Icon -->
		<?php if ( $group_icon ) : ?>
			<i
				class="pm-category-integrations__icon dashicons <?php echo esc_attr( $group_icon ); ?>"
				style="color: <?php echo esc_attr( $group_icon_color ); ?>; background-color: <?php echo esc_attr( $icon_bg ); ?>;"
				aria-hidden="true"
			></i>
		<?php endif; ?>

		<!-- Text: Heading + Subheading -->
		<div class="pm-category-integrations__text">
			<?php if ( $heading ) : ?>
				<div class="pm-category-integrations__heading-wrapper">
					<<?php echo esc_attr( $heading_tag ); ?>
						class="pm-category-integrations__heading"
						<?php if ( $heading_color ) : ?>
							style="color: <?php echo esc_attr( $heading_color ); ?>;"
						<?php endif; ?>
					>
						<?php echo wp_kses_post( $heading ); ?>
					</<?php echo esc_attr( $heading_tag ); ?>>
					<span
						class="pm-category-integrations__count"
						<?php if ( $heading_color ) : ?>
							style="color: <?php echo esc_attr( $heading_color ); ?>;"
						<?php endif; ?>
					>
						(<?php echo esc_html( $total_count ); ?>)
					</span>
				</div>
			<?php endif; ?>

			<?php if ( $subheading ) : ?>
				<p
					class="pm-category-integrations__subheading"
					<?php if ( $subheading_color ) : ?>
						style="color: <?php echo esc_attr( $subheading_color ); ?>;"
					<?php endif; ?>
				>
					<?php echo wp_kses_post( $subheading ); ?>
				</p>
			<?php endif; ?>
		</div>

		<!-- Collapse Toggle (if displayMode is collapsed) -->
		<?php if ( 'collapsed' === $display_mode ) : ?>
			<i
				class="pm-category-integrations__toggle dashicons dashicons-arrow-up-alt2 is-collapsed"
				aria-hidden="true"
			></i>
		<?php endif; ?>

	</div>

	<!-- Integration Features List (matches integration-features-group structure) -->
	<div
		class="pm-category-integrations__features pm-integration-features-group__features <?php echo 'collapsed' === $display_mode ? 'is-hidden' : ''; ?>"
		style="<?php echo esc_attr( $padding_styles ); ?>"
	>
		<?php
		$count = 0;

		while ( $integrations->have_posts() ) :
			$integrations->the_post();
			$count++;

			// In tease mode, hide items beyond teaseCount.
			$is_teased  = ( 'tease' === $display_mode && $count > $tease_count );
			$item_class = 'pm-integration-feature';
			if ( $is_teased ) {
				$item_class .= ' is-teased';
			}
			?>
			<div style="font-size:1.8rem" class="<?php echo esc_attr( $item_class ); ?>">
				<div class="pm-integration-feature__header">
					<span class="pm-tier-checkmark dashicons dashicons-yes" aria-label="<?php esc_attr_e( 'Integration', 'popup-maker' ); ?>"></span>
					<a href="<?php the_permalink(); ?>" class="pm-integration-feature__label pm-integration-feature__link">
						<?php the_title(); ?>
					</a>
				</div>
			</div>
		<?php endwhile; ?>

		<!-- "View all" for tease mode -->
		<?php if ( 'tease' === $display_mode && $total_count > $tease_count ) : ?>
			<?php if ( 'link' === $tease_expand_mode ) : ?>
				<a
					href="<?php echo esc_url( get_term_link( $category ) ); ?>"
					class="pm-category-integrations__view-all"
				>
					<?php
					printf(
						/* translators: %s: category name */
						esc_html__( 'View all %s', 'popup-maker' ),
						esc_html( $category->name )
					);
					?>
				</a>
			<?php else : ?>
				<button
					class="pm-category-integrations__view-all"
					data-wp-on--click="actions.expandTease"
					aria-expanded="false"
				>
					<?php
					printf(
						/* translators: %s: category name */
						esc_html__( 'View all %s', 'popup-maker' ),
						esc_html( $category->name )
					);
					?>
				</button>
			<?php endif; ?>
		<?php endif; ?>
	</div>

</div>
<?php
wp_reset_postdata();
