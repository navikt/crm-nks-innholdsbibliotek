({
    afterRender: function (component, helper) {
        this.superAfterRender();
        const video = this.template.querySelector('video');

        if (video) {
            video.addEventListener('play', (event) => {
                helper.addVideoView(component);
            });

            video.addEventListener('error', (event) => {
                component.set('v.error', true);
            });
        }
    }
});
