({
    getVideoId: function(component) {
        const queryUrl = decodeURIComponent(window.location.search.substring(1));
        const videoId = queryUrl.split('=')[1]; //query should be on format key={videoId}
        let videoSrc = window.location.origin + '/sfsites/c/sfc/servlet.shepherd/document/download/' + videoId;

        component.set('v.videoUrl', videoSrc);

        const videoPlayer =
            '<video width="100%" controls controlsList="nodownload">><source src="' +
            videoSrc +
            '" type="video/mp4" /></video>';
        component.set('v.videoPlayer', videoPlayer);
    }
});
