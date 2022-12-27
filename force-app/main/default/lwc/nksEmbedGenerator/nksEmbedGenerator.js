import { LightningElement, api } from 'lwc';
import getExperienceUrl from '@salesforce/apex/NKS_VideoPlayerCtrl.getLibraryBaseUrl';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class NksEmbedGenerator extends LightningElement {
    libraryBaseUrl;
    @api recordId;

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
        navigator.clipboard.writeText(this.embeddingCode);
        this.showCopyToast();
    }

    showCopyToast() {
        const evt = new ShowToastEvent({
            message: 'kopiert til utklippstavlen.',
            variant: 'success',
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
