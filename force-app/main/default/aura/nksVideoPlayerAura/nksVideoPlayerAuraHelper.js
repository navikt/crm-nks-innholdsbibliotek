/* eslint-disable no-unused-expressions */
({
    getVideoId: function (component) {
        const recordId = component.get('v.recordId');
        let videoSrc;
        if (recordId) {
            //Displaying inside Salesforce
            videoSrc = window.location.origin + '/sfc/servlet.shepherd/document/download/' + recordId;
            component.set('v.videoId', recordId);
            component.set('v.context', 'Standard');
        } else {
            //In community
            const url = window.location.href;
            const videoId = decodeURIComponent(url.substring(url.lastIndexOf('/') + 1));
            component.set('v.videoId', videoId);
            videoSrc = window.location.origin + '/sfsites/c/sfc/servlet.shepherd/document/download/' + videoId;
        }

        component.set('v.videoSrc', videoSrc);
        this.generateVideoPlayer(component);
    },

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

    generateVideoPlayer: function (component) {
        this.getVideoTracks(component).then((subTracks) => {
            let videoPlayer =
                '<video width=100%' +
                ' controls controlsList="nodownload"><source src="' +
                component.get('v.videoSrc') +
                '" type="video/mp4" >';

            if (subTracks && subTracks.length > 0) {
                subTracks.forEach((track) => {
                    videoPlayer +=
                        '<track kind="subtitles" srclang=' +
                        track.srclang +
                        ' label=' +
                        track.languageLabel +
                        ' src="' +
                        track.src +
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
