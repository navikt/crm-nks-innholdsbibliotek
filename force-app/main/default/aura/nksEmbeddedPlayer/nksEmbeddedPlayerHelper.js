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
        getVideoTitle.setParams({videoId: component.get('v.videoId')});

        const videoTitlePromise = new Promise((resolve, reject) => {
            getVideoTitle.setCallback(this, function (response) {
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
        $A.enqueueAction(getVideoTitle);
        return videoTitlePromise;
    },

    getExperienceSiteURL: function (component) {
        let getSiteURL = component.get('c.getLibraryBaseUrl');
        const siteURLPromise = new Promise((resolve, reject) => {
            getSiteURL.setCallback(this, function (response) {
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
        $A.enqueueAction(getSiteURL);
        return siteURLPromise;
    },

    // Called on init of component
    generateVideoPlayer: function (component) {
        let videoSrc;
        let videoPlayer = '';
        this.getExperienceSiteURL(component).then((experienceSiteURL) => {
            videoSrc = experienceSiteURL.replace('/s/', '') + '/sfsites/c/sfc/servlet.shepherd/document/download/' + component.get('v.videoId');
        });
        this.getVideoTitle(component).then((videoTitle) => {
            videoPlayer =
            '<video height=100%; width=100%;' + 
            ' aria-label="' + videoTitle + '"' +  
            ' controls controlsList="nodownload"><source src="' +
            videoSrc + '" type="video/mp4" >';
        });
        
        this.getVideoTracks(component).then((subTracks) => {
            if (subTracks && subTracks.length > 0) {
                let blob;
                subTracks.forEach((track) => {
                    try {
                        blob = new Blob([track.src], { type: 'text/plain' });
                    } catch (e) {
                        console.error('Could not create blob from VersionData. Error: ', e);
                    }
                    const url = window.URL.createObjectURL(blob);                     
                    videoPlayer +=
                        '<track kind="captions" srclang=' +
                        track.srclang +
                        ' label=' +
                        track.languageLabel +
                        ' src="' +
                        url +
                        '">';
                });
            }
            videoPlayer += '</video>'; //Video end
            component.set('v.videoPlayer', videoPlayer);
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
