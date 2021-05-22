document.addEventListener('DOMContentLoaded', (e) => {
    refreshDeviceType(window.innerWidth);
});

window.addEventListener('resize', (e) => {
    refreshDeviceType(window.innerWidth);
});

let deviceType = null;

const refreshHyperchilds = () => {
    console.log('refresh hyperchilds!!');
    const hyperchilds = document.querySelectorAll('.wp-block-hyper-hyperchild');
    hyperchilds && hyperchilds.forEach((hyperchild) => {
        hyperchild.style = hyperchild.getAttribute(`data-${deviceType}-style`);
    });
}

const refreshDeviceType = (width) => {
    switch ( true ) {
        case width > 780: {
            if ( deviceType !== 'desktop' ) {
                deviceType = 'desktop';
                refreshHyperchilds();
            }
            break;
        }
        case width > 360: {
            if ( deviceType !== 'tablet' ) {
                deviceType = 'tablet';
                refreshHyperchilds();
            }     
            break;
        }
        default: {
            if ( deviceType !== 'mobile' ) {
                deviceType = 'mobile';
                refreshHyperchilds();
            }
            break;
        }
    }
}