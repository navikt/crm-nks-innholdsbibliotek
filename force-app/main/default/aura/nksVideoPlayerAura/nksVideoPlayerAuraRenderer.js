({
    afterRender: function (component, helper) {
        this.superAfterRender();
        const video = document.querySelector('video');

        if (video) {
            video.addEventListener('play', (event) => {
                helper.addVideoView(component);
            });
        }
    }
});
