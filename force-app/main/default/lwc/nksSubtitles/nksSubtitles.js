import { LightningElement, wire, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getFileType from '@salesforce/apex/NKS_VideoPlayerCtrl.checkFileType';
import getSubtitleLanguageLinksOnFile from '@salesforce/apex/NKS_VideoPlayerCtrl.getSubtitleLanguageLinksOnFile';
import saveSubtitleLanguageLinks from '@salesforce/apex/NKS_VideoPlayerCtrl.saveSubtitleLanguageLinks';
import getContentVersionIdOnContentDocument from '@salesforce/apex/NKS_VideoPlayerCtrl.getContentVersionIdOnContentDocument';
import showVideoTrackURL from '@salesforce/apex/NKS_VideoPlayerCtrl.showVideoTrackURL';
import { isVideoFile, isSubtitleFile } from 'c/utils';
import { refreshApex } from '@salesforce/apex';
import NORWEGIAN_LABEL from '@salesforce/label/c.NKS_Subtitle_Language_Norwegian';
import ENGLISH_LABEL from '@salesforce/label/c.NKS_Subtitle_Language_English';
import POLISH_LABEL from '@salesforce/label/c.NKS_Subtitle_Language_Polish';


const columns = [
    { label: 'Språk', fieldName: 'languageLabel' },
    { label: 'Link', fieldName: 'src' },
    {
        type: "button", label: '', initialWidth: 110, typeAttributes: {
            label: 'Slett',
            name: 'Delete',
            title: 'Slett',
            disabled: false,
            value: 'delete',
            iconName:'utility:delete',
            variant:'destructive'
        }
    }
];

export default class NksSubtitles extends LightningElement {
    @api recordId; // The Content Document we are on
    contentVersionId; // The related CV Id of the Content Document
    subtitleLinks = [];
    subtitleLink = '';
    columns = columns;

    _wiredSubtitles;
    @wire(getSubtitleLanguageLinksOnFile, { videoId: '$recordId' })
    wiredgetSubtitleLanguageLinksOnFile(result) {
        this._wiredSubtitles = result;
        if (result.error) {
            console.error(result.error);
        } else if (result.data) {
            this.subtitleLinks = JSON.parse(result.data);
        }
    }

    @wire(getContentVersionIdOnContentDocument, { videoId: '$recordId' })
    wiredGetContentVersionIdOnContentDocument(result) {
        if (result.error) {
            console.error(result.error);
        } else if (result.data) {
            this.contentVersionId = result.data;
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
    
    // When on subtitle file type
    videoTrackURL;
    @wire(showVideoTrackURL, { videoId: '$recordId'})
    wiredShowVideoTrackURL(result) {
        if (result.error) {
            console.log(result.error);
        } else if (result.data) {
            this.videoTrackURL = result.data;
        }
    }

    get isSavedButtonDisabled() {
        return this.comboboxValue === '' || this.subtitleLink === '';
    }

    saveSubtitleLink() {
        let data = {srclang: this.comboboxValue, languageLabel: this.comboboxOptions.find(x => x.value === this.comboboxValue)?.label, src: this.subtitleLink};
        let obj = this.subtitleLinks?.find(x => x.srclang === this.comboboxValue);
        // Replace if language already exists in list
        if (obj !== undefined) {
            Object.assign(obj, data);
        } else {
            this.subtitleLinks.push(data);
        }
        saveSubtitleLanguageLinks({ subtitlesAsJson: JSON.stringify(this.subtitleLinks), id: this.contentVersionId }).then(() => {
            refreshApex(this._wiredSubtitles);
            this.showSaveToast('success');
        }).catch(err => {
            console.error(err);
            this.showSaveToast('error');
        });
    }

    deleteSubtitleLink(event) {
        const row = event.detail.row;
        const index = this.subtitleLinks.indexOf(row);
        if (index > -1) {
            this.subtitleLinks.splice(index, 1);
        }
        saveSubtitleLanguageLinks({ subtitlesAsJson: JSON.stringify(this.subtitleLinks), id: this.contentVersionId }).then(() => {
            refreshApex(this._wiredSubtitles);
        }).catch(err => {
            console.error(err);
        });
    }

    handleInputChange(event) {
       this.subtitleLink = event.detail.value;
    }

    comboboxValue = '';
    get comboboxOptions() {
        return [
            { label: NORWEGIAN_LABEL, value: 'no' },
            { label: ENGLISH_LABEL, value: 'en' },
            { label: POLISH_LABEL, value: 'pl' },
        ];
    }

    handleComboboxChange(event) {
        this.comboboxValue = event.detail.value;
        this.subtitleLink = '';
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