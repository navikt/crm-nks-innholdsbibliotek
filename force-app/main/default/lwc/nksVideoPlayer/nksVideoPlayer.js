import { LightningElement, track, api, wire } from 'lwc';
import getVideoTracks from '@salesforce/apex/NKS_VideoPlayerCtrl.getVideoTracks';
import getVideoTitle from '@salesforce/apex/NKS_VideoPlayerCtrl.getVideoTitle';
import getStoredThumbnailLink from '@salesforce/apex/NKS_VideoPlayerCtrl.getStoredThumbnailLink';
import getLibraryBaseUrl from '@salesforce/apex/NKS_VideoPlayerCtrl.getLibraryBaseUrl';
import addViewCount from '@salesforce/apex/NKS_VideoPlayerCtrl.addViewCount';

export default class NksVideoPlayer extends LightningElement {
    @api videoId;
    @track videoPlayer;
    @track videoSrc;
    @track videoTitle;

    connectedCallback() {
        this.generateVideoPlayer();
    }

    renderedCallback() {
        this.attachEventListener();
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
                getVideoTracks()
                    .then((subTracks) => {
                        /*let videoPlayer =
                            '<video class="subtitle-background" height=100%; width=100%;' +
                            ' aria-label="' +
                            this.videoTitle +
                            '"' +
                            (this.thumbnailLink !== 'err'
                                ? ' poster="' + this.thumbnailLink + '"'
                                : '') +
                            ' controls controlsList="nodownload"><source src="' +
                            this.videoSrc +
                            '" type="video/mp4" >';*/
                        if (subTracks && subTracks.length > 0) {
                            let blob;
                            subTracks.forEach((track) => {
                                try {
                                    blob = new Blob([track.src], {
                                        type: 'text/plain',
                                    });
                                } catch (e) {
                                    console.error(
                                        'Could not create blob from VersionData. Error: ',
                                        e
                                    );
                                }
                                const url = window.URL.createObjectURL(blob);
                                this.addTrackToVideo(track, url);
                                /*videoPlayer +=
                                    '<track kind="captions" srclang="' +
                                    track.srclang +
                                    '" label="' +
                                    track.languageLabel +
                                    '" src="' +
                                    url +
                                    '">';*/
                            });
                        }
                        //videoPlayer += '</video>'; //Video end
                        //console.log(videoPlayer);
                        //this.videoPlayer = videoPlayer;
                    })
                    .catch((error) => {
                        console.error(error);
                    });
                return result;
            })
            .catch((error) => {
                console.error(error);
            });
    }

    // Method to add tracks dynamically
    addTrackToVideo(trackData, url) {
        const video = this.template.querySelector('video');

        if (video && trackData && trackData !== undefined && trackData !== null) {
            trackData.forEach((track) => {
                const newTrack = document.createElement('track');
                newTrack.kind = 'captions';
                newTrack.srclang = track.srclang;
                newTrack.label = track.languageLabel;
                newTrack.src = url;

                video.appendChild(newTrack);
            });
        }
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