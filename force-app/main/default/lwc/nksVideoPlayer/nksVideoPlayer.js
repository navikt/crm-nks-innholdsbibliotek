import { LightningElement, api, wire } from 'lwc';
import getFileType from '@salesforce/apex/NKS_VideoPlayerCtrl.checkFileType';
import { isVideoFile } from 'c/utils';
import getVideoTracksInternally from '@salesforce/apex/NKS_VideoPlayerCtrl.getVideoTracksInternally';
import getVideoTitle from '@salesforce/apex/NKS_VideoPlayerCtrl.getVideoTitle';
import getStoredThumbnailLink from '@salesforce/apex/NKS_VideoPlayerCtrl.getStoredThumbnailLink';
import isSandbox from '@salesforce/apex/NKS_VideoPlayerCtrl.isSandbox';
import addViewCount from '@salesforce/apex/NKS_VideoPlayerCtrl.addViewCount';
import VIDEO_ERROR_HEADER from '@salesforce/label/c.NKS_Video_Player_Error_Header';
import VIDEO_ERROR_MESSAGE from '@salesforce/label/c.NKS_Video_Player_Error_Message';

export default class NksVideoPlayer extends LightningElement {
    @api recordId; // Automatically set when within Salesforce
    videoSrc;
    videoTitle;
    thumbnail;
    context;
    isFileTypeMp4;
    tracksAdded = false; // Check whether tracks have been added or not
    subTracks = [];
    error = false;
    videoEventListenerAttached = false;

    labels = {
        VIDEO_ERROR_HEADER,
        VIDEO_ERROR_MESSAGE
    };

    connectedCallback() {
        this.generateVideoPlayer();
    }

    renderedCallback() {
        if (!this.videoEventListenerAttached) {
            this.attachEventListener();
        }
        if (this.videoSrc && this.subTracks.length > 0 && !this.tracksAdded) {
            this.addTracksToVideo();
        }
    }

    get isExperience() {
        return this.context === 'Experience';
    }

    @wire(getFileType, { recordId: '$recordId'})
    wiredGetFileType(result) {
        if (result.error) {
            console.error(result.error);
        } else if (result.data) {
            this.isFileTypeMp4 = isVideoFile(result.data);
            this.filetype = result.data;
        }
    }

    async generateVideoPlayer() {
        try {
            await this.getVideoIdAndSetVideoUrl();
            this.subTracks = await this.fetchSubTracks();
            this.videoTitle = await this.getVideoTitle();
            this.thumbnail = await this.getThumbnailLink();
            this.setThumbnail();
        } catch (error) {
            this.error = error;
            console.error(error);
        }
    }

    async getVideoIdAndSetVideoUrl() {
        if (this.recordId) {
            // Displaying inside Salesforce
            this.videoSrc = window.location.origin + '/sfc/servlet.shepherd/document/download/' + this.recordId;
            this.context = 'Standard';
        } else {
            // In community
            const url = window.location.href;
            const videoId = decodeURIComponent(url.substring(url.lastIndexOf('/') + 1));
            this.recordId = videoId;
            this.context = 'Experience';
            try {
                const sandbox = await isSandbox();
                const baseUrl = sandbox
                    ? window.location.origin + '/ihb/sfsites/c/sfc/servlet.shepherd/document/download/'
                    : window.location.origin + '/sfsites/c/sfc/servlet.shepherd/document/download/';
                this.videoSrc = baseUrl + videoId;
            } catch (error) {
                this.error = error;
                console.error(error);
            }
        }
    }

    async getVideoTitle() {
        try {
            return await getVideoTitle({ videoId: this.recordId });
        } catch (error) {
            console.error(error);
            return '';
        }
    }

    async getThumbnailLink() {
        try {
            return await getStoredThumbnailLink({
                videoId: this.recordId,
                env: this.context,
                windowOrigin: window.location.origin,
            });
        } catch (error) {
            console.error(error);
        }
    }

    setThumbnail() {
        const videoElement = this.template.querySelector('video');
        if (videoElement && this.thumbnail !== undefined && this.thumbnail !== 'err') {
            videoElement.setAttribute('poster', this.thumbnail);
        }
    }

    async fetchSubTracks() {
        try {
            return await getVideoTracksInternally({ videoId: this.recordId });
        } catch (error) {
            console.error(error);
        }
    }

    addTracksToVideo() {
        const videoElement = this.template.querySelector('video');
        if (videoElement && this.subTracks.length > 0) {
            this.subTracks.forEach((track) => {
                try {
                    const newTrack = document.createElement('track');
                    newTrack.kind = 'captions';
                    newTrack.srclang = track.srclang;
                    newTrack.label = track.languageLabel;
                    newTrack.src = track.src;

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
            this.videoEventListenerAttached = true;
            video.addEventListener('play', () => {
                if (!video.paused) {
                    this.addViewCount();
                }
            }, { once : true });
        }
    }

    addViewCount() {
        if (this.recordId) {
            addViewCount({ videoId: this.recordId })
                .catch((error) => {
                    console.error(error);
                });
        }
    }
}