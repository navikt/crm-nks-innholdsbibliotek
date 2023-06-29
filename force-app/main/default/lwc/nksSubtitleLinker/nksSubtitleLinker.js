import { LightningElement, wire, api } from 'lwc';
import showVideoTrackURL from '@salesforce/apex/NKS_VideoPlayerCtrl.showVideoTrackURL';
import { isSubtitleFile } from 'c/utils';

export default class NksSubtitleLinker extends LightningElement {
    @api filetype;
    @api recordId;

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
            var successful = document.execCommand('copy');
            this.showCopyToast(successful ? 'success' : 'error');
        } catch (error) {
            this.showCopyToast('error');
        }
        document.body.removeChild(hiddenInput);
        this.template.querySelector('[data-id="subtitle-copy-button"]').focus(); // Put focus back on copy button - for UU
    }

    showCopyToast(status) {
        const evt = new ShowToastEvent({
            message: status === 'success' ? 'Kopiert til utklippstavlen.' : 'Kunne ikke kopiere.',
            variant: status,
            mode: 'pester'
        });
        this.dispatchEvent(evt);
    }
}