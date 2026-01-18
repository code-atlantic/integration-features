<?php
/**
 * Plugin Name:       Integration Features
 * Plugin URI:        https://github.com/code-atlantic/integration-features
 * Description:       Gutenberg blocks for displaying integration features with tier badges, accordion descriptions, and group organization.
 * Version:           0.4.0
 * Requires at least: 6.7
 * Requires PHP:      7.4
 * Author:            Code Atlantic
 * Author URI:        https://code-atlantic.com
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       integration-features
 *
 * GitHub Plugin URI: https://github.com/code-atlantic/integration-features
 * GitHub Branch:     main
 * Primary Branch:    main
 * Release Asset:     true
 *
 * @package IntegrationFeatures
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
function create_block_integration_features_block_init() {
	// Register the view script module for integration-feature block
	wp_register_script_module(
		'popup-maker/integration-feature-view',
		plugin_dir_url( __FILE__ ) . 'build/integration-features/view.js',
		[ '@wordpress/interactivity' ],
		filemtime( __DIR__ . '/build/integration-features/view.js' )
	);

	// Register the integration-feature block type
	register_block_type( __DIR__ . '/build/integration-features', [
		'view_script_module' => 'popup-maker/integration-feature-view',
	] );

	// Register the view script module for integration-features-group block
	wp_register_script_module(
		'popup-maker/integration-features-group-view',
		plugin_dir_url( __FILE__ ) . 'build/integration-features-group/view.js',
		[ '@wordpress/interactivity' ],
		filemtime( __DIR__ . '/build/integration-features-group/view.js' )
	);

	// Register the integration-features-group block type
	register_block_type( __DIR__ . '/build/integration-features-group', [
		'view_script_module' => 'popup-maker/integration-features-group-view',
	] );

	// Register the section-heading block type
	register_block_type( __DIR__ . '/build/section-heading' );

	// Register the view script module for category-integrations block
	wp_register_script_module(
		'popup-maker/category-integrations-view',
		plugin_dir_url( __FILE__ ) . 'build/category-integrations/view.js',
		[ '@wordpress/interactivity' ],
		filemtime( __DIR__ . '/build/category-integrations/view.js' )
	);

	// Register the category-integrations block type
	register_block_type( __DIR__ . '/build/category-integrations', [
		'view_script_module' => 'popup-maker/category-integrations-view',
	] );
}
add_action( 'init', 'create_block_integration_features_block_init' );
