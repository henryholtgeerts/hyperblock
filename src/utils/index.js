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
        width: size && `${size[0]}px`,
        height: size && `${size[1]}px`,
        transform: `translate(${translate[0]}px, ${translate[1]}px) rotate(${rotate}deg) scale(${scale[0]}, ${scale[1]}) matrix3d(${warp.join(",")})`
    }
}

export const getDeviceStyle = ({attributes, deviceType}) => {
    const cssObject = getDeviceCssObject({attributes, deviceType});
    return Object.keys(cssObject).reduce((acc, key) => (
        acc + key.split(/(?=[A-Z])/).join('-').toLowerCase() + ':' + cssObject[key] + ';'
    ), '');
}