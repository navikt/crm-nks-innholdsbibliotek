import { LightningElement, api, wire } from 'lwc';
import setThumbnailLink from '@salesforce/apex/NKS_VideoPlayerCtrl.setThumbnailLink';
import getThumbnailLinkOnFile from '@salesforce/apex/NKS_VideoPlayerCtrl.getThumbnailLinkOnFile';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class NksThumbnailGenerator extends LightningElement {
    @api recordId;
    @api isVideoFile = false; // True if on video file (mp4)
    @api isSubtitleFile = false; // True if on subtitle file (avoid showing on thumbnail file)

    @wire(getThumbnailLinkOnFile, { videoId: '$recordId' })
    wiredGetThumbnailLinkOnFile(result) {
        if (result.error) {
            console.error(result.error);
        } else if (result.data) {
            this.thumbnailLink = result.data;
        }
    }

    isThumbnailFile = false; // Easier than adding all the possible image variants
    renderedCallback() {
        this.isThumbnailFile = !this.isVideoFile && !this.isSubtitleFile;
    }

    saveThumbnailLink() {
        setThumbnailLink({ videoId: this.recordId, thumbnailLink: this.thumbnailLink });
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
    
    // Will only be shown and used if file is not MP4
    get showThumbnailLink() {
        return window.location.origin + '/sfc/servlet.shepherd/document/download/' + this.recordId;
    }
}