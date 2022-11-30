import { LightningElement, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import getVideoSrc from '@salesforce/apex/NKS_VideoPlayerCtrl.getVideoUrl';

export default class NksVideoPlayer extends LightningElement {
    // Declare the currentPageReference variable in order to track it
    currentPageReference;
    fileRef;
    isLoading = false;

    @wire(CurrentPageReference)
    setCurrentPageReference(currentPageReference) {
        this.currentPageReference = currentPageReference;
        this.getVideoReference();
    }

    getVideoReference() {
        //Get reference from parameters in the pagereference
        this.isLoading = true;
        let currentUrl = this.currentPageReference;
        const reference = str.substring(currentUrl.lastIndexOf('/') + 1);

        getVideoSrc({ videoRef: reference })
            .then(videoSrc => {
                this.fileRef = videoSrc;
            })
            .catch(error => {})
            .finally(() => {
                this.isLoading = false;
            });
    }
}
