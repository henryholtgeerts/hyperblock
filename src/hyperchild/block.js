/**
 * BLOCK: hyperchild
 *
 * Registering a basic block with Gutenberg.
 * Simple block, renders and saves the same content without any interactivity.
 */

//  Import CSS.
import './editor.scss';
import './style.scss';

const { __ } = wp.i18n; // Import __() from wp.i18n
const { registerBlockType, createBlock } = wp.blocks; // Import registerBlockType() from wp.blocks
const { Inserter, InnerBlocks, useBlockProps, BlockControls, InspectorControls } = wp.blockEditor;
const { useDispatch, useSelect } = wp.data;
const { useEffect, useRef, useState } = wp.element;

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
		desktopTransform: {
			type: 'string',
			default: 'matrix(1,0,0,1,0,0) translate(0px, 0px)'
		},
		desktopHeight: {
			type: 'string',
		},
		desktopWidth: {
			type: 'string',
		}
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

		const { attributes } = props;

		const dispatch = useDispatch();

		const contentUnlocked = innerBlocks && innerBlocks[0] && innerBlocks[0].clientId == selectedBlock.clientId;

		const overlayRef = useRef();

		const { innerBlocks, blocks, selectedBlock } = useSelect(select => ({
			innerBlocks: select('core/block-editor').getBlocks(props.clientId),
			blocks: select('core/block-editor').getBlocks(),
			selectedBlock: select('core/block-editor').getBlock( select('core/block-editor').getBlockSelectionStart(props.clientId) )
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
			<div className={ props.className } style={{
				transform: attributes.desktopTransform,
			}}>
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
			<div className={ props.className } style={{
				transform: attributes.desktopTransform,
			}}>
				<InnerBlocks.Content/>
			</div>
		);
	},
} );
