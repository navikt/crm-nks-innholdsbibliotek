({
    getVideoId: function(component) {
        const recordId = component.get('v.recordId');
        let videoSrc;
        if (recordId) {
            //Displaying inside Salesforce
            videoSrc = window.location.origin + '/sfc/servlet.shepherd/document/download/' + recordId;
        } else {
            //In community
            const queryUrl = decodeURIComponent(window.location.search.substring(1));
            const videoId = queryUrl.split('=')[1]; //query should be on format key={videoId}
            videoSrc = window.location.origin + '/sfsites/c/sfc/servlet.shepherd/document/download/' + videoId;
        }
        const videoPlayer =
            '<video width="100%" controls controlsList="nodownload">><source src="' +
            videoSrc +
            '" type="video/mp4" /></video>';
        component.set('v.videoPlayer', videoPlayer);
    }
});
