import { LightningElement, api, wire } from 'lwc';
import setThumbnailLink from '@salesforce/apex/NKS_VideoPlayerCtrl.setThumbnailLink';
import getThumbnailLinkOnFile from '@salesforce/apex/NKS_VideoPlayerCtrl.getThumbnailLinkOnFile';
import getFileType from '@salesforce/apex/NKS_VideoPlayerCtrl.checkFileType';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class NksThumbnailGenerator extends LightningElement {
    @api recordId;
    isVideoFile = false;
    isSubtitleFile = false;
    isThumbnailFile = false;

    @wire(getThumbnailLinkOnFile, { videoId: '$recordId' })
    wiredGetThumbnailLinkOnFile(result) {
        if (result.error) {
            console.error(result.error);
        } else if (result.data) {
            this.thumbnailLink = result.data;
        }
    }

    
    videoFileTypes = ['mp4', 'mov', 'avi', 'wmv', 'flv', 'avchd'];
    subtitleFileTypes = ['vtt']; // Does not support .srt at the moment
    @wire(getFileType, { recordId: '$recordId'})
    wiredGetFileType(result) {
        if (result.error) {
            console.log(result.error);
        } else if (result.data) {
            this.isVideoFile = this.videoFileTypes.includes(result.data);
            this.isSubtitleFile = this.subtitleFileTypes.includes(result.data);
            this.isThumbnailFile = !this.isVideoFile && !this.isSubtitleFile; // Easier than checking all the image variants
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
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(this.showThumbnailLink);
            this.showCopyToast();
        } else {
            let textArea = document.createElement('textarea');
            textArea.value = this.showThumbnailLink;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            textArea.remove();
            this.showCopyToast();
        }        
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