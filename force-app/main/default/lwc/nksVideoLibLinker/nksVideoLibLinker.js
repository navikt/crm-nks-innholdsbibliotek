import { LightningElement, api } from 'lwc';
import getExperienceUrl from '@salesforce/apex/NKS_VideoPlayerCtrl.getLibraryUrl';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class NksVideoLibLinker extends LightningElement {
    @api recordId;

    experienceUrl;

    connectedCallback() {
        getExperienceUrl({})
            .then(url => {
                this.experienceUrl = url;
            })
            .catch(error => {});
    }

    handleCopy(event) {
        let copyValue = event.currentTarget.value;
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
    }

    showCopyToast(status) {
        const evt = new ShowToastEvent({
            message: status === 'success' ? 'kopiert til utklippstavlen.' : 'Kunne ikke kopiere',
            variant: status,
            mode: 'pester'
        });
        this.dispatchEvent(evt);
    }

    get libraryUrl() {
        return this.experienceUrl ? this.experienceUrl + '?videoId=' + this.recordId : null;
    }
}
