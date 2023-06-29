import { LightningElement, api } from 'lwc';
import getExperienceUrl from '@salesforce/apex/NKS_VideoPlayerCtrl.getLibraryBaseUrl';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import EMBEDDING_CODE from '@salesforce/label/c.NKS_Embedding_Code';
import COPY_SUCCESS from '@salesforce/label/c.NKS_Copy_Message_Success';
import COPY_FAIL from '@salesforce/label/c.NKS_Copy_Message_Fail';

export default class NksEmbedGenerator extends LightningElement {
    libraryBaseUrl;
    @api recordId;

    labels = {
        EMBEDDING_CODE
    };

    connectedCallback() {
        this.apexGetLibraryUrl();
    }

    apexGetLibraryUrl() {
        getExperienceUrl({})
            .then((url) => {
                this.libraryBaseUrl = url.replace('/s/', '');
            })
            .catch((error) => {
                console.error(JSON.stringify(error, null, 2));
            });
    }
    
    handleCopy() {
        let copyValue = this.embeddingCode;
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
        this.template.querySelector('[data-id="embed-copy-button"]').focus(); // Put focus back on copy button - for UU
    }

    showCopyToast(status) {
        const evt = new ShowToastEvent({
            message: status === 'success' ? COPY_SUCCESS : COPY_FAIL,
            variant: status,
            mode: 'pester'
        });
        this.dispatchEvent(evt);
    }

    get lightningOutUrl() {
        return this.libraryBaseUrl ? this.libraryBaseUrl + '/lightning/lightning.out.js' : '';
    }

    get embeddingCode() {
        return (
            '<div id="video-player"></div>' +
            '<script src="' +
            this.lightningOutUrl +
            '"></script>' +
            '<script>' +
            '$Lightning.use(' +
            "'c:nksEmbeddedVideoApp'," +
            'function () {' +
            '$Lightning.createComponent(' +
            "'c:nksEmbeddedPlayer'," +
            "{ videoId: '" +
            this.recordId +
            "' }," +
            "'video-player'," +
            'function (cmp) {' +
            "console.log('Aura component was created');" +
            '}' +
            ');' +
            '},' +
            "'" +
            this.libraryBaseUrl +
            "'" +
            ');' +
            '</script>'
        );
    }
}
