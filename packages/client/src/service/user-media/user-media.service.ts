import {canvasStream} from "@/service/user-media/canvas-stream";

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
            const animation = canvasStream();
            animation.start();
            return animation.getStream().getVideoTracks()[0];
        }

        return navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream: MediaStream) => stream.getVideoTracks()[0]);
    }

    async hasDevice(kind: 'videoinput' | 'audioinput'): Promise<boolean> {
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.some(d => d.kind === kind);
    }
}