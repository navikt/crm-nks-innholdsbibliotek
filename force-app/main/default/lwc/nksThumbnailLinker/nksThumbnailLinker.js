import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { isVideoFile, isSubtitleFile } from 'c/utils';
import label from 'c/utils';

export default class NksThumbnailLinker extends LightningElement {
    @api recordId;
    @api filetype;
    label = label;

    handleCopy() {
        let copyValue = this.showThumbnailLink;
        let hiddenInput = document.createElement('input');
        hiddenInput.value = copyValue;
        document.body.appendChild(hiddenInput);
        hiddenInput.focus();
        hiddenInput.select();
        try {
            // eslint-disable-next-line @locker/locker/distorted-document-exec-command
            document.execCommand('copy');
        } catch (error) {
            this.showCopyToast('error');
        }
        document.body.removeChild(hiddenInput);
        this.template.querySelector('[data-id="thumbnail-copy-button"]').focus(); // Put focus back on copy button - for UU
    }

    showCopyToast(status) {
        const evt = new ShowToastEvent({
            message: label.COPY_FAIL,
            variant: status,
            mode: 'pester'
        });
        this.dispatchEvent(evt);
    }

    // Easier than checking all the image variants
    get isThumbnailFile() {
        return !isSubtitleFile(this.filetype) && !isVideoFile(this.filetype);
    }

    get showThumbnailLink() {
        return window.location.origin + '/sfc/servlet.shepherd/document/download/' + this.recordId;
    }
}
