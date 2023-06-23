import { LightningElement, api, wire } from 'lwc';
import setThumbnailLink from '@salesforce/apex/NKS_VideoPlayerCtrl.setThumbnailLink';
import getThumbnailLinkOnFile from '@salesforce/apex/NKS_VideoPlayerCtrl.getThumbnailLinkOnFile';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { isVideoFile, isSubtitleFile } from 'c/utils';

export default class NksThumbnailGenerator extends LightningElement {
    @api recordId;
    @api filetype;

    @wire(getThumbnailLinkOnFile, { videoId: '$recordId' })
    wiredGetThumbnailLinkOnFile(result) {
        if (result.error) {
            console.error(result.error);
        } else if (result.data) {
            this.thumbnailLink = result.data;
        }
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
        let copyValue = this.showThumbnailLink;
        let hiddenInput = document.createElement('input');
        hiddenInput.value = copyValue;
        document.body.appendChild(hiddenInput);
        hiddenInput.focus();
        hiddenInput.select();
        try {
            var successful = document.execCommand('copy');
            this.showCopyToast(successful ? 'success' : 'error');
        } catch (error) {
            this.showCopyToast('error');
        }
        document.body.removeChild(hiddenInput);
        this.template.querySelector('[data-id="thumbnail-copy-button"]').focus(); // Put focus back on copy button - for UU
    }

    showCopyToast(status) {
        const evt = new ShowToastEvent({
            message: status === 'success' ? 'Kopiert til utklippstavlen.' : 'Kunne ikke kopiere.',
            variant: status,
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

    get isVideoFile() {
        return isVideoFile(this.filetype);
    }

    get isSubtitleFile() {
        return isSubtitleFile(this.filetype);
    }

    // Easier than checking all the image variants
    get isThumbnailFile() { 
        return !this.isVideoFile && !this.isSubtitleFile;
    }
    
    // Will only be shown and used if file is not MP4
    get showThumbnailLink() {
        return window.location.origin + '/sfc/servlet.shepherd/document/download/' + this.recordId;
    }
}