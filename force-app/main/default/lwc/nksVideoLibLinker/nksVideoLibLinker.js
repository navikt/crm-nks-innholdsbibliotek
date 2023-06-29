import { LightningElement, api } from 'lwc';
import getExperienceUrl from '@salesforce/apex/NKS_VideoPlayerCtrl.getLibraryUrl';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { label } from 'c/utils';

export default class NksVideoLibLinker extends LightningElement {
    @api recordId;
    label = label;
    
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
