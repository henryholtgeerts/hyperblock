export const getDeviceFrame = ({attributes, deviceType}) => {
    const { mobileFrame, tabletFrame, desktopFrame } = attributes;
    switch ( deviceType ) {
        case 'desktop': {
            return desktopFrame;
            break;
        }
        case 'tablet': {
            return {
                ...desktopFrame,
                ...tabletFrame,
            };
            break;
        }
        case 'mobile': {
            return {
                ...desktopFrame,
                ...tabletFrame,
                ...mobileFrame
            };
            break;
        }
    }
}

export const getDeviceCssObject = ({attributes, deviceType}) => {
    const { size, translate, rotate, scale, warp } = getDeviceFrame({deviceType, attributes});
    return {
        width: size && size[0] && `${size[0]}px`,
        maxWidth: size && size[0] && '9999px',
        height: size && size[1] && `${size[1]}px`,
        transform: `translate(${translate[0]}px, ${translate[1]}px) rotate(${rotate}deg) scale(${scale[0]}, ${scale[1]}) matrix3d(${warp.join(",")})`
    }
}

export const getDeviceStyle = ({attributes, deviceType}) => {
    const cssObject = getDeviceCssObject({attributes, deviceType});
    return Object.keys(cssObject).reduce((acc, key) => (
        acc + key.split(/(?=[A-Z])/).join('-').toLowerCase() + ':' + cssObject[key] + ';'
    ), '');
}

export const getDefaultFrame = (block, defaultPosition) => {

    const { name, attributes } = block;
    const childRect = document.querySelector(`[data-block="${block.clientId}`).getBoundingClientRect();
    const parentRect = document.querySelector(`[data-block="${block.clientId}`).closest('[data-type="hyper/hyperblock').getBoundingClientRect();

    const frame = {
        size: null,
        translate: [defaultPosition[0], (defaultPosition[1]) - (childRect.height / 2)],
        scale: [1, 1],
        rotate: 0,
        warp: [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ],
    }

    switch ( name ) {
        case 'core/embed': {
            switch ( attributes.providerNameSlug ) {
                case 'youtube': {
                    return {
                        ...frame,
                        size: [560, null],
                        translate: [(defaultPosition[0] - 280), (defaultPosition[1]) - (202 / 2)]
                    }
                }
                default: {
                    return {
                        ...frame,
                        size: [400, null],
                        translate: [(defaultPosition[0] - 200), (defaultPosition[1]) - (202 / 2)]
                    }
                }
            }
        }
        case 'core/paragraph': {
            return {
                ...frame,
                size: [400, null],
                translate: [(defaultPosition[0] - 200), (defaultPosition[1]) - (childRect.height / 2)]
            }
        }
        case 'core/media-text': {
            return {
                ...frame,
                size: [660, null],
                translate: [(defaultPosition[0] - 330), (defaultPosition[1]) - (260 / 2)]
            }
        }
        case 'core/table': {
            return {
                ...frame,
                size: [380, null],
                translate: [(defaultPosition[0] - 165), (defaultPosition[1]) - (200 / 2)]
            }
        }
        default: {
            return frame;
        }
    }
}