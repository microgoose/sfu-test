import {createCanvasAnimation} from "@/service/user-media/canvas-animation";
import {VIDEO_FRAMERATE, VIDEO_HEIGHT, VIDEO_WIDTH} from "@/domain/media.config";

export class UserMediaService {

    async requestAudio() {
        if (!await this.hasDevice('audioinput'))
            throw new Error('No audio input provided');

        return navigator.mediaDevices.getUserMedia({ audio: true })
            .then((stream: MediaStream) => stream.getAudioTracks()[0]);
    }

    async requestVideo() {
        if (!await this.hasDevice('videoinput')) {
            // throw new Error('No video input provided');
            const animation = createCanvasAnimation();
            animation.start();
            return animation.getStream().getVideoTracks()[0];
        }

        const options = {
            video: {
                width:  { ideal: VIDEO_WIDTH },
                height: { ideal: VIDEO_HEIGHT },
                frameRate: { ideal: VIDEO_FRAMERATE }
            }
        };
        return navigator.mediaDevices
            .getUserMedia(options)
            .then((stream) => stream.getVideoTracks()[0]);
    }

    async hasDevice(kind: 'videoinput' | 'audioinput'): Promise<boolean> {
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.some(d => d.kind === kind);
    }
}