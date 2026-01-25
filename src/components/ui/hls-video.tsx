import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface HlsVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
    src: string;
    isHls?: boolean;
}

export const HlsVideo: React.FC<HlsVideoProps> = ({ src, isHls = true, ...props }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (isHls) {
            if (Hls.isSupported()) {
                const hls = new Hls();
                hls.loadSource(src);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    if (props.autoPlay) {
                        video.play().catch(e => console.log("Autoplay blocked:", e));
                    }
                });

                return () => {
                    hls.destroy();
                };
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                // For Safari
                video.src = src;
            }
        } else {
            video.src = src;
        }
    }, [src, isHls, props.autoPlay]);

    return (
        <video
            ref={videoRef}
            src={!isHls ? src : undefined}
            {...props}
        />
    );
};
