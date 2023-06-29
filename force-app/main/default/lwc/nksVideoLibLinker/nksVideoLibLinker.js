import { LightningElement, api } from 'lwc';
import getExperienceUrl from '@salesforce/apex/NKS_VideoPlayerCtrl.getLibraryUrl';
import VIDEO_LIBRARY_LINK from '@salesforce/label/c.NKS_Video_Library_Link';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import COPY_FAIL from '@salesforce/label/c.NKS_Copy_Message_Fail';

export default class NksVideoLibLinker extends LightningElement {
    @api recordId;
    labels = {
        VIDEO_LIBRARY_LINK
    };

    libraryUrl;
    connectedCallback() {
        getExperienceUrl({ recordId: this.recordId })
            .then((url) => {
                this.libraryUrl = url;
            })
            .catch((error) => {
                console.error(error);
            });
    }

    handleCopy(event) {
        let copyValue = event.currentTarget.value;
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
        this.template.querySelector('[data-id="video-copy-button"]').focus(); // Put focus back on copy button - for UU
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
