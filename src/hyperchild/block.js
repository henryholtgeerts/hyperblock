/**
 * BLOCK: hyperchild
 *
 * Registering a basic block with Gutenberg.
 * Simple block, renders and saves the same content without any interactivity.
 */

import { getDeviceStyle, getDeviceCssObject } from '../utils';

//  Import CSS.
import './editor.scss';
import './style.scss';

const { __ } = wp.i18n; // Import __() from wp.i18n
const { registerBlockType, createBlock } = wp.blocks; // Import registerBlockType() from wp.blocks
const { Inserter, InnerBlocks, useBlockProps, BlockControls, InspectorControls } = wp.blockEditor;
const { Panel, PanelBody, PanelRow, TextControl } = wp.components;
const { useDispatch, useSelect } = wp.data;
const { useEffect, useRef, useState, Fragment } = wp.element;

/**
 * Register: aa Gutenberg Block.
 *
 * Registers a new block provided a unique name and an object defining its
 * behavior. Once registered, the block is made editor as an option to any
 * editor interface where blocks are implemented.
 *
 * @link https://wordpress.org/gutenberg/handbook/block-api/
 * @param  {string}   name     Block name.
 * @param  {Object}   settings Block settings.
 * @return {?WPBlock}          The block, if it has been successfully
 *                             registered; otherwise `undefined`.
 */
registerBlockType( 'hyper/hyperchild', {
	// Block name. Block names must be string that contains a namespace prefix. Example: my-plugin/my-custom-block.
	title: __( 'Hyperchild' ), // Block title.
	icon: 'shield', // Block icon from Dashicons → https://developer.wordpress.org/resource/dashicons/.
	category: 'layout', // Block category — Group blocks together based on common traits E.g. common, formatting, layout widgets, embed.
	keywords: [
		__( 'collage' ),
		__( 'hyper' ),
		__( 'hyperchild' ),
	],
	attributes: {
		layerName: {
			type: 'string',
			default: 'New Layer',
		},
		desktopFrame: {
			type: 'object',
			default: {
				size: null,
				translate: [ 0, 0 ],
				scale: [ 1, 1 ],
				rotate: 0,
				warp: [
					1, 0, 0, 0,
					0, 1, 0, 0,
					0, 0, 1, 0,
					0, 0, 0, 1,
				],
			}
		},
		tabletFrame: {
			type: 'object',
			default: {}
		},
		mobileFrame: {
			type: 'object',
			default: {}
		},
	},

	/**
	 * The edit function describes the structure of your block in the context of the editor.
	 * This represents what the editor will render when the block is used.
	 *
	 * The "edit" property must be a valid function.
	 *
	 * @link https://wordpress.org/gutenberg/handbook/block-api/block-edit-save/
	 *
	 * @param {Object} props Props.
	 * @returns {Mixed} JSX Component.
	 */
	edit: ( props ) => {

		const { attributes, setAttributes } = props;

		const dispatch = useDispatch();

		const contentUnlocked = innerBlocks && innerBlocks[0] && innerBlocks[0].clientId == selectedBlock.clientId;

		const overlayRef = useRef();

		const { innerBlocks, blocks, selectedBlock, deviceType } = useSelect(select => ({
			innerBlocks: select('core/block-editor').getBlocks(props.clientId),
			blocks: select('core/block-editor').getBlocks(),
			selectedBlock: select('core/block-editor').getBlock( select('core/block-editor').getBlockSelectionStart(props.clientId) ),
			deviceType: select( 'core/edit-post' ).__experimentalGetPreviewDeviceType().toLowerCase(),
		}));

		useEffect(() => {
			const handleDblClick = (e) => {
				dispatch( 'core/block-editor' ).selectBlock( innerBlocks[0].clientId )
			}
			overlayRef.current && overlayRef.current.addEventListener('dblclick', handleDblClick)
			return function cleanup () {
				overlayRef.current && overlayRef.current.removeEventListener('dblclick', handleDblClick)
			}
		}, [overlayRef, innerBlocks]);

		return (
			<Fragment>
				<InspectorControls>
					<PanelBody title="Workspace" initialOpen={ true }>
						<PanelRow>
							<TextControl
								label="Layer Name"
								value={ attributes.layerName }
								onChange={ ( val ) => setAttributes( { layerName: val } ) }
							/>
						</PanelRow>
					</PanelBody>
				</InspectorControls>
				<div className={ props.className } style={getDeviceCssObject({deviceType, attributes})}>
					<div 
						className="hyper-hyperchild__overlay" 
						ref={overlayRef} 
						style={{
							display: innerBlocks && selectedBlock && innerBlocks[0] && innerBlocks[0].clientId == selectedBlock.clientId ? 'none' : 'block'
						}} 
					/>
					<InnerBlocks
						style={{
							padding: 0, 
							margin: 0
						}}
						renderAppender={false}
					/>
				</div>
			</Fragment>
		);
	},

	/**
	 * The save function defines the way in which the different attributes should be combined
	 * into the final markup, which is then serialized by Gutenberg into post_content.
	 *
	 * The "save" property must be specified and must be a valid function.
	 *
	 * @link https://wordpress.org/gutenberg/handbook/block-api/block-edit-save/
	 *
	 * @param {Object} props Props.
	 * @returns {Mixed} JSX Frontend HTML.
	 */
	save: ( props ) => {

		const { attributes } = props;

		return (
			<div 
				className={ props.className } 
				style={getDeviceCssObject({
					attributes,
					deviceType: 'desktop'
				})}
				data-desktop-style={getDeviceStyle({
					attributes,
					deviceType: 'desktop'
				})}
				data-tablet-style={getDeviceStyle({
					attributes,
					deviceType: 'tablet'
				})}
				data-mobile-style={getDeviceStyle({
					attributes,
					deviceType: 'mobile'
				})}
				>
				<InnerBlocks.Content/>
			</div>
		);
	},
} );
