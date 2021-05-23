/**
 * BLOCK: hyperblock
 *
 * Registering a basic block with Gutenberg.
 * Simple block, renders and saves the same content without any interactivity.
 */

 import { getDeviceFrame, getDefaultFrame } from '../utils';
 import Moveable from 'react-moveable';

//  Import CSS.
import './editor.scss';
import './style.scss';

const { __ } = wp.i18n; // Import __() from wp.i18n
const { registerBlockType, createBlock } = wp.blocks; // Import registerBlockType() from wp.blocks
const { Inserter, InnerBlocks, useBlockProps, BlockControls, InspectorControls } = wp.blockEditor;
const { ToolbarButton, Panel, PanelBody, PanelRow, ToggleControl } = wp.components;
const { useDispatch, useSelect } = wp.data;
const { useEffect, useState, Fragment, useCallback } = wp.element;

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
	supports: {
		align: [
			'full',
			'wide'
		]
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

		const [ sizingMode, setSizingMode ] = useState('scale');

		const [targetNode, setTargetNode] = useState(null);

		const [ showGuides, setShowGuides ] = useState(false);

		const { replaceInnerBlocks, updateBlockAttributes } = useDispatch("core/block-editor");

		const dispatch = useDispatch();

		const { innerBlocks, blocks, selectedBlock, deviceType } = useSelect(select => ({
			innerBlocks: select('core/block-editor').getBlocks(props.clientId),
			blocks: select('core/block-editor').getBlocks(),
			selectedBlock: select('core/block-editor').getBlock( select('core/block-editor').getBlockSelectionStart(props.clientId) ),
			deviceType: select( 'core/edit-post' ).__experimentalGetPreviewDeviceType().toLowerCase(),
		}));

		useEffect(() => {
			document.querySelector('.popover-slot').style = null;
			if ( selectedBlock && selectedBlock.name === 'hyper/hyperchild' ) {
				document.querySelector('.popover-slot').style.display = 'none';
			}
		}, [selectedBlock]);

		useEffect(() => {
			let needReplacing = false;
			const newInnerBlocks = innerBlocks.map((block) => {
				if ( block.name !== 'hyper/hyperchild' ) {
					needReplacing = true;
					return createBlock('hyper/hyperchild', {
						desktopFrame: getDefaultFrame(block),
						tabletFrame: {},
						mobileFrame: {}
					}, [block]);
				} else {
					return block;
				}
			})
			if ( needReplacing ) {
				replaceInnerBlocks(props.clientId, newInnerBlocks, false);
			}
		}, [innerBlocks]);

		useEffect(() => {
			const handleKeyPress = (e) => {
				switch ( e.key ) {
					case 'W': {
						setSizingMode('warp');
						break;
					}
					case 'S': {
						setSizingMode('scale');
						break;
					}
					case 'R': {
						setSizingMode('resize');
						break;
					}
				}
			}
			if ( selectedBlock && selectedBlock.clientId === props.clientId || innerBlocks && innerBlocks.includes(selectedBlock) ) {
				window.addEventListener('keypress', handleKeyPress);
			}
			return function cleanup () {
				window.removeEventListener('keypress', handleKeyPress);
			}
		}, [innerBlocks, selectedBlock])

		const ALLOWED_BLOCKS = [ 'hyper/hyperchild' ];

		return (
			<Fragment>
				<InspectorControls key="settting">
					<PanelBody title="Appearance" icon="microphone" initialOpen={ true }>
						<PanelRow>
							<ToggleControl
								label="Show Guides"
								checked={ showGuides }
								onChange={ (val) => setShowGuides(val) }
							/>
						</PanelRow>
					</PanelBody>
                </InspectorControls>
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
						onDragStart={({set}) => {
							set(getDeviceFrame({
								attributes: selectedBlock && selectedBlock.attributes,
								deviceType,
							}).translate);
						}}
						onDrag={ ({ beforeTranslate }) => {
							const newFrame = JSON.parse(JSON.stringify(getDeviceFrame({
								attributes: selectedBlock && selectedBlock.attributes,
								deviceType,
							})));
							newFrame.translate = beforeTranslate;
							dispatch(updateBlockAttributes(selectedBlock.clientId, {
								[`${deviceType}Frame`]: newFrame,
							}))
						}}

						resizable={sizingMode && sizingMode === 'resize'}
						onResizeStart={({target, set, setOrigin, dragStart}) => {
							setOrigin(["%", "%"]);
							const style = window.getComputedStyle(target);
							const cssWidth = parseFloat(style.width);
							const cssHeight = parseFloat(style.height);
							set([cssWidth, cssHeight]);
							dragStart && dragStart.set(getDeviceFrame({
								attributes: selectedBlock && selectedBlock.attributes,
								deviceType,
							}).translate);
						}}
						onResize={({ width, height, drag }) => {
							const newFrame = JSON.parse(JSON.stringify(getDeviceFrame({
								attributes: selectedBlock && selectedBlock.attributes,
								deviceType,
							})));
							newFrame.size = [ width, height ];
							newFrame.translate = drag.beforeTranslate;
							dispatch(updateBlockAttributes(selectedBlock.clientId, {
								[`${deviceType}Frame`]: newFrame,
							}))
						}}

						scalable={sizingMode && sizingMode === 'scale'}
						onScaleStart={ ({ set, dragStart }) => {
							set(getDeviceFrame({
								attributes: selectedBlock && selectedBlock.attributes,
								deviceType,
							}).scale);
							dragStart && dragStart.set(getDeviceFrame({
								attributes: selectedBlock && selectedBlock.attributes,
								deviceType,
							}).translate);
						}}
						onScale={ ({scale, drag}) => { 
							const newFrame = JSON.parse(JSON.stringify(getDeviceFrame({
								attributes: selectedBlock && selectedBlock.attributes,
								deviceType,
							})));
							newFrame.scale = scale;
							newFrame.translate = drag.beforeTranslate;
							dispatch(updateBlockAttributes(selectedBlock.clientId, {
								[`${deviceType}Frame`]: newFrame,
							}))
						}}

						rotatable={true}
						throttleRotate={0}
						onRotateStart={ ({set}) => {
							set(getDeviceFrame({
								attributes: selectedBlock && selectedBlock.attributes,
								deviceType,
							}).rotate);
						}}
						onRotate={ ({ beforeRotate }) => {
							const newFrame = JSON.parse(JSON.stringify(getDeviceFrame({
								attributes: selectedBlock && selectedBlock.attributes,
								deviceType,
							})));
							newFrame.rotate = beforeRotate;
							dispatch(updateBlockAttributes(selectedBlock.clientId, {
								[`${deviceType}Frame`]: newFrame,
							}))
						}}

						warpable={sizingMode && sizingMode === 'warp'}
						onWarpStart={({set}) => {
							set(getDeviceFrame({
								attributes: selectedBlock && selectedBlock.attributes,
								deviceType,
							}).warp);
						}}
						onWarp={ ({matrix}) => {
							const newFrame = JSON.parse(JSON.stringify(getDeviceFrame({
								attributes: selectedBlock && selectedBlock.attributes,
								deviceType,
							})));
							newFrame.warp = matrix;
							dispatch(updateBlockAttributes(selectedBlock.clientId, {
								[`${deviceType}Frame`]: newFrame,
							}))
						}}
					/>
					{ showGuides && (
						<Fragment>
							<div style={{height: '100%', width: '100%', position: 'absolute', top: 0, left: 0}}>
								<div className="wp-block alignwide" style={{height: '100%', border: '1px solid green'}}/>
							</div>
							<div style={{height: '100%', width: '100%', position: 'absolute', top: 0, left: 0}}>
								<div className="wp-block" style={{height: '100%', border: '1px solid red'}}/>
							</div>
						</Fragment>
					)}
					<div className="hyperblock__container">
						<InnerBlocks
							renderAppender={false}
						/>
					</div>
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
				<div className="hyperblock__container">
					<InnerBlocks.Content/>
				</div>
			</div>
		);
	},
} );
