import { LightningElement, track, api } from 'lwc';
import getVideoTracks from '@salesforce/apex/NKS_VideoPlayerCtrl.getVideoTracks';
import getVideoTitle from '@salesforce/apex/NKS_VideoPlayerCtrl.getVideoTitle';
import getStoredThumbnailLink from '@salesforce/apex/NKS_VideoPlayerCtrl.getStoredThumbnailLink';
import getLibraryBaseUrl from '@salesforce/apex/NKS_VideoPlayerCtrl.getLibraryBaseUrl';
import addViewCount from '@salesforce/apex/NKS_VideoPlayerCtrl.addViewCount';

export default class NksVideoPlayer extends LightningElement {
    @api videoId; // Set through Lightning Out param
    videoSrc;
    videoTitle;
    thumbnail;
    tracksAdded = false; // Check whether tracks have been added or not
    subTracks = [];

    connectedCallback() {
        //this.fetchSubTracks(); // Fetch subtitles before render
        this.generateVideoPlayer();
    }

    renderedCallback() {
        this.attachEventListener();

        if (this.videoSrc && this.subTracks.length > 0 && !this.tracksAdded) {
            this.addTracksToVideo();
        }
    }

    async generateVideoPlayer() {
        try {
            this.subTracks = await this.fetchSubTracks();
            this.videoSrc = await this.generateVideoUrl();
            this.videoTitle = await this.getVideoTitle();
            this.thumbnail = await this.getThumbnailLink();
            this.setThumbnail();
        } catch (error) {
            console.error(error);
        }
    }

    async generateVideoUrl() {
        try {
            const libraryBaseUrl = await getLibraryBaseUrl();
            return (
                libraryBaseUrl.replace('/s/', '') +
                '/sfsites/c/sfc/servlet.shepherd/document/download/' +
                this.videoId
            );
        } catch (error) {
            throw error;
        }
    }

    async getVideoTitle() {
        try {
            return await getVideoTitle({ videoId: this.videoId });
        } catch (error) {
            throw error;
        }
    }

    async getThumbnailLink() {
        try {
            return await getStoredThumbnailLink({
                videoId: this.videoId,
                env: 'Embed',
                windowOrigin: '',
            });
        } catch (error) {
            throw error;
        }
    }

    setThumbnail() {
        const videoElement = this.template.querySelector('video');
        if (videoElement && this.thumbnail !== undefined) {
            videoElement.setAttribute('poster', this.thumbnail);
        }
    }

    async fetchSubTracks() {
        try {
            return await getVideoTracks({ videoId: this.videoId });
        } catch (error) {
            console.error(error);
        }
    }

    addTracksToVideo() {
        const videoElement = this.template.querySelector('video');
        if (videoElement && this.subTracks.length > 0) {
            this.subTracks.forEach((track) => {
                try {
                    const blob = new Blob([track.src], { type: 'text/plain' });
                    const url = window.URL.createObjectURL(blob);

                    const newTrack = document.createElement('track');
                    newTrack.kind = 'captions';
                    newTrack.srclang = track.srclang;
                    newTrack.label = track.languageLabel;
                    newTrack.src = url;

                    videoElement.appendChild(newTrack);
                } catch (e) {
                    console.error(
                        'Could not create blob from VersionData. Error: ',
                        e
                    );
                }
            });
        }
        this.tracksAdded = true; // Set the flag to true to avoid adding tracks again on rerender
    }

    attachEventListener() {
        const video = this.template.querySelector('video');
        if (video) {
            video.addEventListener('play', () => {
                this.addViewCount();
            });
        }
    }

    addViewCount() {
        if (this.videoId) {
            addViewCount({ videoId: this.videoId })
                .then(() => {
                    // View count was updated
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    }
}