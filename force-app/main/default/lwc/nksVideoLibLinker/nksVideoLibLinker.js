import { LightningElement, api } from 'lwc';
import getExperienceUrl from '@salesforce/apex/NKS_VideoPlayerCtrl.getLibraryUrl';

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

    get libraryUrl() {
        return this.experienceUrl ? this.experienceUrl + this.recordId : null;
    }
}
