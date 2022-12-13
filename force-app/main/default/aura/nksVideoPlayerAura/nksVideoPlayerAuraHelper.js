/* eslint-disable no-unused-expressions */
({
    getVideoId: function (component) {
        const recordId = component.get('v.recordId');
        let videoSrc;
        let videoSize = '80%';
        if (recordId) {
            //Displaying inside Salesforce
            videoSrc = window.location.origin + '/sfc/servlet.shepherd/document/download/' + recordId;
            component.set('v.videoId', recordId);
            component.set('v.context', 'Standard');
            videoSize = '100%';
        } else {
            //In community
            const url = window.location.href;
            const videoId = decodeURIComponent(url.substring(url.lastIndexOf('/') + 1));
            component.set('v.videoId', videoId);
            component.set('v.recordId', videoId);
            videoSrc = window.location.origin + '/sfsites/c/sfc/servlet.shepherd/document/download/' + videoId;
        }
        const videoPlayer =
            '<video width=' +
            videoSize +
            ' controls controlsList="nodownload">><source src="' +
            videoSrc +
            '" type="video/mp4" /></video>';
        component.set('v.videoPlayer', videoPlayer);
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
