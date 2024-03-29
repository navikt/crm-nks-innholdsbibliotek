/* eslint-disable no-unused-expressions */
({
    getVideoTracks: function (component) {
        let getTracksAction = component.get('c.getVideoTracks');

        getTracksAction.setParams({
            videoId: component.get('v.videoId')
        });

        const trackPromise = new Promise((resolve, reject) => {
            getTracksAction.setCallback(this, function (response) {
                const state = response.getState();
                if (state === 'SUCCESS') {
                    resolve(response.getReturnValue());
                } else if (state === 'ERROR') {
                    let errors = response.getError();
                    console.error(JSON.stringify(errors));
                    reject(JSON.stringify(errors));
                }
            });
        });
        $A.enqueueAction(getTracksAction);
        return trackPromise;
    },

    getVideoTitle: function (component) {
        let getVideoTitle = component.get('c.getVideoTitle');
        getVideoTitle.setParams({ videoId: component.get('v.videoId') });

        const videoTitlePromise = new Promise((resolve, reject) => {
            getVideoTitle.setCallback(this, function (response) {
                const state = response.getState();
                if (state === 'SUCCESS') {
                    resolve(response.getReturnValue());
                    this.getThumbnailLink(component).then((thumbnail) => {
                        component.set('v.thumbnailLink', thumbnail);
                    });
                } else if (state === 'ERROR') {
                    let errors = response.getError();
                    console.error(JSON.stringify(errors));
                    reject(JSON.stringify(errors));
                }
            });
        });
        $A.enqueueAction(getVideoTitle);
        return videoTitlePromise;
    },

    getThumbnailLink: function (component) {
        let getThumbnail = component.get('c.getStoredThumbnailLink');
        getThumbnail.setParams({
            videoId: component.get('v.videoId'),
            env: 'Embed',
            windowOrigin: ''
        });
        const thumbnailPromise = new Promise((resolve, reject) => {
            getThumbnail.setCallback(this, function (response) {
                const state = response.getState();
                if (state === 'SUCCESS') {
                    resolve(response.getReturnValue());
                    this.getVideoTracks(component).then((subTracks) => {
                        let videoPlayer =
                            '<video class="subtitle-background" height=100%; width=100%;' +
                            ' aria-label="' +
                            component.get('v.videoTitle') +
                            '"' +
                            (component.get('v.thumbnailLink') !== 'err'
                                ? ' poster="' + component.get('v.thumbnailLink') + '"'
                                : '') +
                            ' controls controlsList="nodownload"><source src="' +
                            component.get('v.videoSrc') +
                            '" type="video/mp4" >';
                        if (subTracks && subTracks.length > 0) {
                            let blob;
                            subTracks.forEach((track) => {
                                try {
                                    blob = new Blob([track.src], { type: 'text/plain' });
                                } catch (e) {
                                    console.error('Could not create blob from VersionData. Error: ', e);
                                }
                                // eslint-disable-next-line @locker/locker/distorted-url-create-object-url
                                const url = window.URL.createObjectURL(blob);
                                videoPlayer +=
                                    '<track kind="captions" srclang="' +
                                    track.srclang +
                                    '" label="' +
                                    track.languageLabel +
                                    '" src="' +
                                    url +
                                    '">';
                            });
                        }
                        videoPlayer += '</video>'; //Video end
                        console.log(videoPlayer);
                        component.set('v.videoPlayer', videoPlayer);
                    });
                } else if (state === 'ERROR') {
                    let errors = response.getError();
                    console.error(JSON.stringify(errors));
                    reject(JSON.stringify(errors));
                }
            });
        });
        $A.enqueueAction(getThumbnail);
        return thumbnailPromise;
    },

    getExperienceSiteURL: function (component) {
        let getSiteURL = component.get('c.getLibraryBaseUrl');
        const siteURLPromise = new Promise((resolve, reject) => {
            getSiteURL.setCallback(this, function (response) {
                const state = response.getState();
                if (state === 'SUCCESS') {
                    resolve(response.getReturnValue());
                    this.getVideoTitle(component).then((title) => {
                        component.set('v.videoTitle', title);
                    });
                } else if (state === 'ERROR') {
                    let errors = response.getError();
                    console.error(JSON.stringify(errors));
                    reject(JSON.stringify(errors));
                }
            });
        });
        $A.enqueueAction(getSiteURL);
        return siteURLPromise;
    },

    // Called on init of component
    generateVideoPlayer: function (component) {
        // getExperienceSiteURL starts the chaining of promises and ends with getVideoTracks() which creates the HTML video tag with required attributes
        this.getExperienceSiteURL(component).then((experienceSiteURL) => {
            component.set(
                'v.videoSrc',
                experienceSiteURL.replace('/s/', '') +
                    '/sfsites/c/sfc/servlet.shepherd/document/download/' +
                    component.get('v.videoId')
            );
        });
    },

    addVideoView: function (component) {
        let viewCountAction = component.get('c.addViewCount');

        viewCountAction.setParams({
            videoId: component.get('v.videoId')
        });

        viewCountAction.setCallback(this, function (response) {
            const state = response.getState();
            if (state === 'SUCCESS') {
                //View count was updated
            } else if (state === 'ERROR') {
                let errors = response.getError();
                console.error(JSON.stringify(errors));
            }
        });
        $A.enqueueAction(viewCountAction);
    }
});
