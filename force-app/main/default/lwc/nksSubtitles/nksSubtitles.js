import { LightningElement, wire, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getFileType from '@salesforce/apex/NKS_VideoPlayerCtrl.checkFileType';
import getSubtitleLanguageLinksOnFile from '@salesforce/apex/NKS_VideoPlayerCtrl.getSubtitleLanguageLinksOnFile';
import saveSubtitleLanguageLinks from '@salesforce/apex/NKS_VideoPlayerCtrl.saveSubtitleLanguageLinks';
import showVideoTrackURL from '@salesforce/apex/NKS_VideoPlayerCtrl.showVideoTrackURL';

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

    isFileTypeMp4 = false;
    videoFileTypes = ['mp4', 'mov', 'avi', 'wmv', 'flv', 'avchd'];
    isSubtitleFile = false;
    @wire(getFileType, { recordId: '$recordId'})
    wiredGetFileType(result) {
        if (result.error) {
            console.log(result.error);
        } else if (result.data) {
            this.isFileTypeMp4 = this.videoFileTypes.includes(result.data);
            this.isSubtitleFile = result.data === 'vtt'; // .srt not yet supported
        }
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
        saveSubtitleLanguageLinks({ cvObj: data });
        this.showSaveToast();
    }

    handleInputChange(event) {
        const strippedTargetId = event.target.id.split('-')[0]; // Remove added random integer
        this.subtitleLinks.forEach(element => {
            if (element.language === strippedTargetId) {
                element.link = event.detail.value;
            }
        });
    }

    showSaveToast() {
        const evt = new ShowToastEvent({
            message: 'Undertekstlink lagret.',
            variant: 'success',
            mode: 'pester'
        });
        this.dispatchEvent(evt);
    }

    handleCopy() {
        navigator.clipboard.writeText(this.videoTrackURL);
        this.showCopyToast();
    }

    showCopyToast() {
        const evt = new ShowToastEvent({
            message: 'Kopiert til utklippstavlen.',
            variant: 'success',
            mode: 'pester'
        });
        this.dispatchEvent(evt);
    }
}