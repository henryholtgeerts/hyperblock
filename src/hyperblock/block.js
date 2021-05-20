/**
 * BLOCK: hyperblock
 *
 * Registering a basic block with Gutenberg.
 * Simple block, renders and saves the same content without any interactivity.
 */

import Moveable from 'react-moveable';

//  Import CSS.
import './editor.scss';
import './style.scss';

const { __ } = wp.i18n; // Import __() from wp.i18n
const { registerBlockType, createBlock } = wp.blocks; // Import registerBlockType() from wp.blocks
const { Inserter, InnerBlocks, useBlockProps, BlockControls, InspectorControls } = wp.blockEditor;
const { ToolbarButton, Panel, PanelBody, PanelRow, ToggleControl } = wp.components;
const { useDispatch, useSelect } = wp.data;
const { useEffect, useState, Fragment } = wp.element;

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
registerBlockType( 'hyper/hyperblock', {
	// Block name. Block names must be string that contains a namespace prefix. Example: my-plugin/my-custom-block.
	title: __( 'Hyperblock' ), // Block title.
	icon: 'shield', // Block icon from Dashicons → https://developer.wordpress.org/resource/dashicons/.
	category: 'layout', // Block category — Group blocks together based on common traits E.g. common, formatting, layout widgets, embed.
	keywords: [
		__( 'collage' ),
		__( 'hyper' ),
		__( 'hyperblock' ),
	],

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

		const [targetNode, setTargetNode] = useState(null);

		const { replaceInnerBlocks } = useDispatch("core/block-editor");

		const { innerBlocks, blocks, selectedBlock } = useSelect(select => ({
			innerBlocks: select('core/block-editor').getBlocks(props.clientId),
			blocks: select('core/block-editor').getBlocks(),
			selectedBlock: select('core/block-editor').getBlock( select('core/block-editor').getBlockSelectionStart(props.clientId) )
		}));

		useEffect(() => {
			document.querySelector('.popover-slot').style = null;
			if ( selectedBlock && selectedBlock.name === 'hyper/hyperchild' ) {
				document.querySelector('.popover-slot').style.display = 'none';
			}
		}, [selectedBlock])

		useEffect(() => {
			let needReplacing = false;
			const newInnerBlocks = innerBlocks.map((block) => {
				if ( block.name !== 'hyper/hyperchild' ) {
					needReplacing = true;
					return createBlock('hyper/hyperchild', {}, [block]);
				} else {
					return block;
				}
			})
			if ( needReplacing ) {
				replaceInnerBlocks(props.clientId, newInnerBlocks, false);
			}
		}, [innerBlocks])

		const ALLOWED_BLOCKS = [ 'hyper/hyperchild' ];

		return (
			<Fragment>
				<BlockControls>
					<Inserter
						rootClientId={ props.clientId }
						renderToggle={ ( { onToggle, disabled } ) => (
							<ToolbarButton
								onClick={onToggle}
								disabled={ disabled }
								label="Add a Block"
								icon="plus"
							/>
						) }
						isAppender
					/>
				</BlockControls>
				<div className={ props.className }>
					<Moveable
						target={innerBlocks.includes(selectedBlock) && document.querySelector(`[data-block="${selectedBlock.clientId}"] > div`)}
						container={document.querySelector(`[data-block="${props.clientId}"] > div`)}

						draggable={true}
						onDrag={({
							target,
							transform,
						}) => {
							target.style.transform = transform;
						}}

						// resizable={true}
						// onResize={({
						// 	delta,
						// 	target,
						// 	width,
						// 	height
						// }) => {
						// 	delta[0] && (target.style.width = `${width}px`);
						// 	delta[1] && (target.style.height = `${height}px`);
						// }}

						scalable={true}
						throttleScale={0}
						onScale={({
							target,
							transform
						}) => {
							target.style.transform = transform;
						}}

						rotatable={true}
						throttleRotate={0}
						onRotate={({
							target,
							transform
						}) => {
							target.style.transform = transform;
						}}


						// warpable={true}
						// onWarpStart={({ target, clientX, clientY }) => {
						// 	if ( typeof target.matrix !== 'array' ) {
						// 		target.matrix = [
						// 			1, 0, 0, 0,
						// 			0, 1, 0, 0,
						// 			0, 0, 1, 0,
						// 			0, 0, 0, 1,
						// 		];
						// 	}
						// }}
						// onWarp={({
						// 	target,
						// 	clientX,
						// 	clientY,
						// 	delta,
						// 	dist,
						// 	multiply,
						// 	transform,
						// }) => {
						// 	target.matrix = multiply(target.matrix, delta);
						// 	target.style.transform = `matrix3d(${target.matrix.join(",")})`;
						// }}
					/>
					<InnerBlocks
						//allowedBlocks={ ALLOWED_BLOCKS }
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
		return (
			<div className={ props.className }>
				<InnerBlocks.Content/>
			</div>
		);
	},
} );
