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
