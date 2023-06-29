import { LightningElement, wire, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import showVideoTrackURL from '@salesforce/apex/NKS_VideoPlayerCtrl.showVideoTrackURL';
import { isSubtitleFile, label } from 'c/utils';

export default class NksSubtitleLinker extends LightningElement {
    @api filetype;
    @api recordId;
    label = label;

    get isSubtitleFile() {
        return isSubtitleFile(this.filetype);
    }

    videoTrackURL;
    @wire(showVideoTrackURL, { videoId: '$recordId'})
    wiredShowVideoTrackURL(result) {
        if (result.error) {
            console.log(result.error);
        } else if (result.data) {
            this.videoTrackURL = result.data;
        }
    }

    handleCopy() {
        let copyValue = this.videoTrackURL;
        let hiddenInput = document.createElement('input');
        hiddenInput.value = copyValue;
        document.body.appendChild(hiddenInput);
        hiddenInput.focus();
        hiddenInput.select();
        try {
            document.execCommand('copy');
        } catch (error) {
            this.showCopyToast('error');
        }
        document.body.removeChild(hiddenInput);
        this.template.querySelector('[data-id="subtitle-copy-button"]').focus(); // Put focus back on copy button - for UU
    }

    showCopyToast(status) {
        const evt = new ShowToastEvent({
            message: COPY_FAIL,
            variant: status,
            mode: 'pester'
        });
        this.dispatchEvent(evt);
    }
}