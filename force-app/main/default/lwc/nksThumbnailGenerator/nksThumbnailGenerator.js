import { LightningElement, api, wire } from 'lwc';
import setThumbnailLink from '@salesforce/apex/NKS_VideoPlayerCtrl.setThumbnailLink';
import getThumbnailLinkOnFile from '@salesforce/apex/NKS_VideoPlayerCtrl.getThumbnailLinkOnFile';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { isVideoFile, isSubtitleFile } from 'c/utils';
import COPY_SUCCESS from '@salesforce/label/c.NKS_Copy_Message_Success';
import COPY_FAIL from '@salesforce/label/c.NKS_Copy_Message_Fail';
import THUMBNAIL_SAVE from '@salesforce/label/c.NKS_Thumbnail_Save';
import SAVE_FAIL from '@salesforce/label/c.NKS_Save_Message_Fail';
import THUMBNAIL_LINK from '@salesforce/label/c.NKS_Thumbnail_Link';
import SAVE from '@salesforce/label/c.NKS_Button_Save';
import THUMBNAIL_PLACEHOLDER from '@salesforce/label/c.NKS_Thumbnail_Placeholder';
import THUMBNAIL_BUTTON_TITLE from '@salesforce/label/c.NKS_Thumbnail_Button_Title';

export default class NksThumbnailGenerator extends LightningElement {
    @api recordId;
    @api filetype;

    labels = {
        THUMBNAIL_LINK,
        SAVE,
        THUMBNAIL_PLACEHOLDER,
        THUMBNAIL_BUTTON_TITLE
    };

    @wire(getThumbnailLinkOnFile, { videoId: '$recordId' })
    wiredGetThumbnailLinkOnFile(result) {
        if (result.error) {
            console.error(result.error);
        } else if (result.data) {
            this.thumbnailLink = result.data;
        }
    }

    saveThumbnailLink() {
        setThumbnailLink({ videoId: this.recordId, thumbnailLink: this.thumbnailLink }).then(() => {
            this.showSaveToast('success');
        }).catch(err => {
            console.error(err);
            this.showSaveToast('error');
        });
        
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
            message: status === 'success' ? COPY_SUCCESS : COPY_FAIL,
            variant: status,
            mode: 'pester'
        });
        this.dispatchEvent(evt);
    }

    showSaveToast(status) {
        const evt = new ShowToastEvent({
            message: status === 'success' ? THUMBNAIL_SAVE : SAVE_FAIL,
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