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

export const getDefaultFrame = (block) => {

    const { name, attributes } = block;
    const childRect = document.querySelector(`[data-block="${block.clientId}`).getBoundingClientRect();
    const parentRect = document.querySelector(`[data-block="${block.clientId}`).closest('[data-type="hyper/hyperblock').getBoundingClientRect();

    const frame = {
        size: null,
        translate: [0, (parentRect.height / 2) - (childRect.height / 2)],
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
                        translate: [-280, (parentRect.height / 2) - (202 / 2)]
                    }
                }
                default: {
                    return {
                        ...frame,
                        size: [400, null],
                        translate: [-200, (parentRect.height / 2) - (202 / 2)]
                    }
                }
            }
        }
        case 'core/paragraph': {
            return {
                ...frame,
                size: [400, null],
                translate: [-200, (parentRect.height / 2) - (childRect.height / 2)]
            }
        }
        case 'core/media-text': {
            return {
                ...frame,
                size: [660, null],
                translate: [-330, (parentRect.height/ 2) - (260 / 2)]
            }
        }
        case 'core/table': {
            return {
                ...frame,
                size: [380, null],
                translate: [-165, (parentRect.height/ 2) - (200 / 2)]
            }
        }
        default: {
            return frame;
        }
    }
}