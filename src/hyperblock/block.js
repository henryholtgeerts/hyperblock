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
const { ToolbarButton, Panel, PanelBody, PanelRow, ToggleControl, ResizableBox } = wp.components;
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
	attributes: {
		height: {
			type: 'number',
			default: 500,
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

		console.log('props!!', props);

		const {
			attributes: { height },
			setAttributes,
			toggleSelection,
		} = props;

		const [ inlineAppenderCoordinates, setInlineAppenderCoordinates ] = useState(0, 0);
		const [ isInlineAppenderVisible, setIsInlineAppenderVisible ] = useState(false);

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
					const blockWidth = document.querySelector(`.${props.className}`).getBoundingClientRect().width;
					const defaultPosition = isInlineAppenderVisible ? [(inlineAppenderCoordinates[0] - ( blockWidth/2 )), inlineAppenderCoordinates[1]] : [0, (height/2)];
					return createBlock('hyper/hyperchild', {
						desktopFrame: getDefaultFrame(block, defaultPosition),
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

		useEffect(() => {
			const blockNode = document.querySelector(`.${props.className}`);
			if ( selectedBlock && selectedBlock.clientId !== props.clientId ) {
				setIsInlineAppenderVisible(false);
			}
			const handleDblClick = (e) => {
				setIsInlineAppenderVisible(true);
				setInlineAppenderCoordinates([e.offsetX, e.offsetY]);
			}
			const handleClick = (e) => {
				setIsInlineAppenderVisible(false);
			}
			blockNode.addEventListener('dblclick', handleDblClick);
			blockNode.addEventListener('click', handleClick);
			return function cleanup () {
				blockNode.removeEventListener('dblclick', handleDblClick);
				blockNode.removeEventListener('click', handleClick);
			}
		}, [props, selectedBlock])

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
				<ResizableBox
					size={ {
						height,
					} }
					minHeight="50"
					minWidth="50"
					enable={ {
						top: false,
						right: false,
						bottom: true,
						left: false,
						topRight: false,
						bottomRight: false,
						bottomLeft: false,
						topLeft: false,
					} }
					onResizeStop={ ( event, direction, elt, delta ) => {
						setAttributes( {
							height: parseInt( height + delta.height, 10 ),
						} );
						toggleSelection( true );
					} }
					onResizeStart={ () => {
						toggleSelection( false );
					} }
				>
				{ isInlineAppenderVisible && (
					<div
						style={{
							position: 'absolute',
							width: '35px',
							height: '35px',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							border: '1px solid black',
							borderRadius: '50%',
							left: `${(inlineAppenderCoordinates[0] - 17)}px`,
							top: `${(inlineAppenderCoordinates[1] - 17)}px`,
						}}
					>
						<Inserter
							rootClientId={ props.clientId }
							renderToggle={({onToggle}) => {
								return (
									<div style={{width: '35px', height: '35px'}} 
										onMouseEnter={() => { 
											if ( document.querySelector('.block-editor-inserter__menu') === null ) {
												onToggle();
											}
										}} 
									/>
								)
							}}
							isAppender
						/>
					</div>
				)}
					<div className={ props.className } style={{height: `${height}px`}}>
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
				</ResizableBox>
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

		const { 
			attributes: { height },
			className
		} = props;

		return (
			<div className={ className } style={{height: `${height}px`}}>
				<div className="hyperblock__container">
					<InnerBlocks.Content/>
				</div>
			</div>
		);
	},
} );
