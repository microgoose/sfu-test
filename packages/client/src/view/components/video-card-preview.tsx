interface VideoCardLoaderProps {
    name: string
}

export const VideoCardPreview = (props: VideoCardLoaderProps) => {
    return (
        <div class='room-video room-video__preview'>
            <h3>{props.name}</h3>
        </div>
    );
};