<?php
/**
 * Plugin Name:       Integration Features
 * Description:       Example block scaffolded with Create Block tool.
 * Version:           0.1.0
 * Requires at least: 6.7
 * Requires PHP:      7.4
 * Author:            The WordPress Contributors
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       integration-features
 *
 * @package CreateBlock
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
}
add_action( 'init', 'create_block_integration_features_block_init' );
