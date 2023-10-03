import { LightningElement, api } from 'lwc';
import getExperienceUrl from '@salesforce/apex/NKS_VideoPlayerCtrl.getLibraryBaseUrl';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import label from 'c/utils';

export default class NksEmbedGenerator extends LightningElement {
    @api recordId;
    libraryBaseUrl;
    label = label;

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
            document.execCommand('copy');
        } catch (error) {
            this.showCopyToast('error');
        }
        document.body.removeChild(hiddenInput);
        this.template.querySelector('[data-id="embed-copy-button"]').focus(); // Put focus back on copy button - for UU
    }

    showCopyToast(status) {
        const evt = new ShowToastEvent({
            message: label.COPY_FAIL,
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
            "'c:nksVideoEmbeddingApp'," +
            'function () {' +
            '$Lightning.createComponent(' +
            "'c:nksVideoPlayer'," +
            "{ videoId: '" +
            this.recordId +
            "' }," +
            "'video-player'," +
            'function (cmp) {' +
            "console.log('LWC component was created');" +
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
