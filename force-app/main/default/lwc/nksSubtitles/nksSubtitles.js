import { LightningElement, wire, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getFileType from '@salesforce/apex/NKS_VideoPlayerCtrl.checkFileType';
import getSubtitleLanguageLinksOnFile from '@salesforce/apex/NKS_VideoPlayerCtrl.getSubtitleLanguageLinksOnFile';
import saveSubtitleLanguageLinks from '@salesforce/apex/NKS_VideoPlayerCtrl.saveSubtitleLanguageLinks';
import showVideoTrackURL from '@salesforce/apex/NKS_VideoPlayerCtrl.showVideoTrackURL';
import { isVideoFile, isSubtitleFile } from 'c/utils';

export default class NksSubtitles extends LightningElement {
    @api recordId; // The Content Document we are on
    contentVersionId; // The related CV Id of the Content Document
    subtitleLinks = [];

    @wire(getSubtitleLanguageLinksOnFile, { videoId: '$recordId' })
    wiredgetSubtitleLanguageLinksOnFile(result) {
        if (result.error) {
            console.error(result.error);
        } else if (result.data) {
            this.contentVersionId = result.data.Id;
            this.subtitleLinks = this.setSubtitleLinkDataOnWire(Object.assign({}, result.data));
        }
    }

    filetype;
    @wire(getFileType, { recordId: '$recordId'})
    wiredGetFileType(result) {
        if (result.error) {
            console.log(result.error);
        } else if (result.data) {
            this.filetype = result.data;
        }
    }

    get isVideoFile() {
        return isVideoFile(this.filetype);
    }

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

    setSubtitleLinkDataOnWire(recordData) {
        const languageMap = { NKS_Subtitle_Link_Norwegian__c: 'Norsk', NKS_Subtitle_Link_English__c: 'Engelsk', NKS_Subtitle_Link_Polish__c: 'Polsk' };
        delete recordData.Id; // Do not create another input field based on Id
        let data = [];
        for (const field in recordData) {
            data.push({ language: languageMap[field], link: recordData[field], relatedField: field });
        }
        return data;
    }

    saveSubtitleLink() {
        let data = {};
        this.subtitleLinks.forEach(element => {
            data[element.relatedField] = element.link;
        });
        data.Id = this.contentVersionId;
        saveSubtitleLanguageLinks({ cvObj: data }).then(() => {
            this.showSaveToast('success');
        }).catch(err => {
            console.error(err);
            this.showSaveToast('error');
        });
    }

    handleInputChange(event) {
        let obj = this.subtitleLinks.find(x => x.language === event.target.dataset.id);
        if (typeof obj !== undefined) {
            obj.link = event.detail.value;
        }
    }

    showSaveToast(status) {
        const evt = new ShowToastEvent({
            message: status === 'success' ? 'Undertekstlink lagret.' : 'Kunne ikke lagre.',
            variant: status,
            mode: 'pester'
        });
        this.dispatchEvent(evt);
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