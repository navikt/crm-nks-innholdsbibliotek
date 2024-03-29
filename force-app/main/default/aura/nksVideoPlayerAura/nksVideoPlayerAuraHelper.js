/* eslint-disable no-unused-expressions */
({
    // Called on init of component
    getVideoId: function (component) {
        const recordId = component.get('v.recordId');
        let videoSrc;
        if (recordId) {
            //Displaying inside Salesforce
            videoSrc = window.location.origin + '/sfc/servlet.shepherd/document/download/' + recordId;
            component.set('v.videoId', recordId);
            component.set('v.context', 'Standard');
            component.set('v.videoSrc', videoSrc);
            this.generateVideoPlayer(component);
        } else {
            //In community
            const url = window.location.href;
            const videoId = decodeURIComponent(url.substring(url.lastIndexOf('/') + 1));
            component.set('v.videoId', videoId);
            component.set('v.recordId', videoId);
            component.set('v.context', 'Experience');
            this.getInstanceType(component)
                .then((isSandbox) => {
                    videoSrc = isSandbox
                        ? window.location.origin + '/ihb/sfsites/c/sfc/servlet.shepherd/document/download/' + videoId
                        : window.location.origin + '/sfsites/c/sfc/servlet.shepherd/document/download/' + videoId;
                })
                .finally(() => {
                    component.set('v.videoSrc', videoSrc);
                    this.generateVideoPlayer(component);
                });
        }
    },

    getThumbnailLink: function (component) {
        let getThumbnail = component.get('c.getStoredThumbnailLink');
        getThumbnail.setParams({
            videoId: component.get('v.videoId'),
            env: component.get('v.context'),
            windowOrigin: window.location.origin
        });
        const thumbnailPromise = new Promise((resolve, reject) => {
            getThumbnail.setCallback(this, function (response) {
                const state = response.getState();
                if (state === 'SUCCESS') {
                    resolve(response.getReturnValue());
                    this.getVideoTracks(component).then((subTracks) => {
                        let videoPlayer =
                        '<video class="subtitle-background" height=40%; width=60%;' +
                        ' aria-label="' + component.get('v.videoTitle') + '"' +
                        (component.get('v.thumbnailLink') !== 'err' ? ' poster="' + component.get('v.thumbnailLink') + '"' : '') +
                        ' controls controlsList="nodownload"><source src="' +
                        component.get('v.videoSrc') +
                        '" type="video/mp4" >';
                        if (subTracks && subTracks.length > 0) {
                            subTracks.forEach((track) => {
                                videoPlayer +=
                                    '<track kind="subtitles" srclang="' +
                                    track.srclang +
                                    '" label="' +
                                    track.languageLabel +
                                    '" src="' +
                                    track.src +
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

    getInstanceType: function (component) {
        let getInstanceType = component.get('c.isSandbox');
        const instancePromise = new Promise((resolve, reject) => {
            getInstanceType.setCallback(this, function (response) {
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
        $A.enqueueAction(getInstanceType);
        return instancePromise;
    },

    // Subtitles
    getVideoTracks: function (component) {
        let getTracksAction = component.get('c.getVideoTracksInternally');
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

    generateVideoPlayer: function (component) {
        this.getVideoTitle(component).then((title) => {
            component.set('v.videoTitle', title);
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
