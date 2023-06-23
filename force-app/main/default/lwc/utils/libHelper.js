export function isVideoFile(data) {
    const videoFileTypes = ['mp4', 'mov', 'avi', 'wmv', 'flv', 'avchd'];
    return videoFileTypes.includes(data);
}

export function isSubtitleFile(data) {
    const subtitleFileTypes = ['vtt']; // Does not support .srt at the moment
    return subtitleFileTypes.includes(data);
}
