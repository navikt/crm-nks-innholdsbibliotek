({
    getVideoId: function(component) {
        const url = window.location.href;
        const videoId = url.substring(url.lastIndexOf('/') + 1);

        let getVideoAction = cmp.get('c.serverEcho');
        getVideoAction.setParams({ firstName: cmp.get('v.firstName') });

        // Create a callback that is executed after
        // the server-side action returns
        getVideoAction.setCallback(this, function(response) {
            const state = response.getState();
            if (state !== 'SUCCESS') {
                component.set('v.error', true);
                return;
            } else {
                const videoUrl = response.getReturnValue();
                component.set('v.videoUrl', videoUrl);
            }
        });

        $A.enqueueAction(getVideoAction);

        console.log('VIDEO ID IS: ' + videoId);
        component.set('v.videoId', videoId);
    }
});