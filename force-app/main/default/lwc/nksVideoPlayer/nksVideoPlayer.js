import { LightningElement, track, api, wire } from 'lwc';
import getVideoTracks from '@salesforce/apex/NKS_VideoPlayerCtrl.getVideoTracks';
import getVideoTitle from '@salesforce/apex/NKS_VideoPlayerCtrl.getVideoTitle';
import getStoredThumbnailLink from '@salesforce/apex/NKS_VideoPlayerCtrl.getStoredThumbnailLink';
import getLibraryBaseUrl from '@salesforce/apex/NKS_VideoPlayerCtrl.getLibraryBaseUrl';
import addViewCount from '@salesforce/apex/NKS_VideoPlayerCtrl.addViewCount';

export default class NksVideoPlayer extends LightningElement {
    @api videoId; // Set through Lightning Out param
    @track videoPlayer;
    @track videoSrc;
    @track videoTitle;
    @track subTracks; // Store subtracks here
    @track tracksAdded = false; // Check whether tracks have been added or not

    connectedCallback() {
        this.fetchSubTracks(); // Fetch subtracks before rendering
        this.generateVideoPlayer();
    }

    renderedCallback() {
        this.attachEventListener();

        if (this.videoSrc && this.subTracks && this.subTracks.length > 0 && !this.tracksAdded) {
            this.addTracksToVideo();
        }
    }

    generateVideoPlayer() {
        this.getExperienceSiteURL()
            .then((experienceSiteURL) => {
                this.videoSrc =
                    experienceSiteURL.replace('/s/', '') +
                    '/sfsites/c/sfc/servlet.shepherd/document/download/' +
                    this.videoId;
            })
            .catch((error) => {
                console.error(error);
            });
    }

    getExperienceSiteURL() {
        return getLibraryBaseUrl()
            .then((libraryBaseUrl) => {
                this.getVideoTitle()
                    .then((title) => {
                        this.videoTitle = title;
                    })
                    .catch((error) => {
                        console.error(error);
                    });

                return libraryBaseUrl;
            })
            .catch((error) => {
                console.error(error);
            });
    }

    getVideoTitle() {
        return getVideoTitle({ videoId: this.videoId })
            .then((result) => {
                this.getThumbnailLink().then((thumbnail) => {
                    const videoElement = this.template.querySelector('video');
                    if (videoElement) {
                        // Add a dynamic attribute to the video element
                        videoElement.setAttribute('poster', thumbnail);
                    }
                });

                return result;
            })
            .catch((error) => {
                console.error(error);
            });
    }

    getThumbnailLink() {
        return getStoredThumbnailLink({
            videoId: this.videoId,
            env: 'Embed',
            windowOrigin: '',
        })
            .then((result) => {
                return result;
            })
            .catch((error) => {
                console.error(error);
            });
    }

    fetchSubTracks() {
        getVideoTracks({ videoId: this.videoId })
            .then((subTracks) => {
                this.subTracks = subTracks;
            })
            .catch((error) => {
                console.error(error);
            });
    }

    addTracksToVideo() {
        const video = this.template.querySelector('video');

        if (video && this.subTracks && this.subTracks.length > 0) {
            this.subTracks.forEach((track) => {
                try {
                    const blob = new Blob([track.src], { type: 'text/plain' });
                    const url = window.URL.createObjectURL(blob);

                    const newTrack = document.createElement('track');
                    newTrack.kind = 'captions';
                    newTrack.srclang = track.srclang;
                    newTrack.label = track.languageLabel;
                    newTrack.src = url;

                    video.appendChild(newTrack);
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