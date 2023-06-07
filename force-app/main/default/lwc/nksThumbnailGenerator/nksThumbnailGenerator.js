import { LightningElement, api, wire } from 'lwc';
import setThumbnailLink from '@salesforce/apex/NKS_VideoPlayerCtrl.setThumbnailLink';
import getStoredThumbnailLink from '@salesforce/apex/NKS_VideoPlayerCtrl.getStoredThumbnailLink';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

export default class NksThumbnailGenerator extends LightningElement {
    @api recordId;
    @api isVideoFile = false; // True if on video file (mp4) - false if not (likely thumbnail)

    @wire(getStoredThumbnailLink, { videoId: '$recordId', env: 'Standard', windowOrigin: ''})
    wiredGetThumbnailLink(result) {
        if (result.error) {
            console.log(result.error);
        } else if (result.data) {
            this.thumbnailLink = result.data;
        }
    }

    connectedCallback() {
        console.log('isVideoFile: ', this.isVideoFile);
    }

    renderedCallback() {
        console.log('isVideoFile: ', this.isVideoFile);
    }
    attachThumbnail() {
        console.log(this.recordId);
        console.log(this.thumbnailLink);
        setThumbnailLink({ videoId: this.recordId, thumbnailLink: this.thumbnailLink });
        refreshApex(this.thumbnailLink);
        this.showSaveToast();
    }

    thumbnailLink;
    handleInputChange(event) {
        this.thumbnailLink = event.detail.value;
    }

    handleCopy() {
        navigator.clipboard.writeText(this.showThumbnailLink);
        this.showCopyToast();
    }

    showCopyToast() {
        const evt = new ShowToastEvent({
            message: 'Kopiert til utklippstavlen.',
            variant: 'success',
            mode: 'pester'
        });
        this.dispatchEvent(evt);
    }

    showSaveToast() {
        const evt = new ShowToastEvent({
            message: 'Thumbnail-link lagret.',
            variant: 'success',
            mode: 'pester'
        });
        this.dispatchEvent(evt);
    }
    
    get showThumbnailLink() {
        return window.location.origin + '/sfc/servlet.shepherd/document/download/' + this.recordId;
    }
}