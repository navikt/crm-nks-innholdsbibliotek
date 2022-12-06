({
    getVideoId: function(component) {
        const recordId = component.get('v.recordId');
        let videoSrc;
        let videoSize = '80%';
        if (recordId) {
            //Displaying inside Salesforce
            videoSrc = window.location.origin + '/sfc/servlet.shepherd/document/download/' + recordId;
            component.set('v.videoId', recordId);
            videoSize = '100%';
        } else {
            //In community
            const queryUrl = decodeURIComponent(window.location.search.substring(1));
            const videoId = queryUrl.split('=')[1]; //query should be on format key={videoId}
            component.set('v.videoId', videoId);
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

    addVideoView: function(component) {
        let viewCountAction = component.get('c.addViewCount');

        viewCountAction.setParams({
            videoId: component.get('v.videoId')
        });

        viewCountAction.setCallback(this, function(response) {
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
