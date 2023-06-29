import { LightningElement, wire, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getFileType from '@salesforce/apex/NKS_VideoPlayerCtrl.checkFileType';
import getSubtitleLanguageLinksOnFile from '@salesforce/apex/NKS_VideoPlayerCtrl.getSubtitleLanguageLinksOnFile';
import saveSubtitleLanguageLinks from '@salesforce/apex/NKS_VideoPlayerCtrl.saveSubtitleLanguageLinks';
import getContentVersionIdOnContentDocument from '@salesforce/apex/NKS_VideoPlayerCtrl.getContentVersionIdOnContentDocument';
import { isVideoFile, label } from 'c/utils';
import { refreshApex } from '@salesforce/apex';

const columns = [
    { label: LANGUAGE, fieldName: 'languageLabel' },
    { label: LINK, fieldName: 'src' },
    {
        type: "button", initialWidth: 110, typeAttributes: {
            label: DELETE,
            name: DELETE,
            title: 'Slett undertekstrelasjon',
            disabled: false,
            value: 'delete',
            iconName:'utility:delete',
            variant:'destructive'
        }
    }
];

export default class NksSubtitles extends LightningElement {
    @api recordId; // The Content Document we are on
    contentVersionId; // The related Content Version Id of the Content Document
    subtitleLinks = [];
    subtitleLink = '';
    columns = columns;
    label = label;

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

    get isSavedButtonDisabled() {
        return this.comboboxValue === '' || this.subtitleLink === '';
    }

    saveSubtitleLink() {
        let data = {srclang: this.comboboxValue, languageLabel: this.comboboxOptions.find(x => x.value === this.comboboxValue)?.internationalLabel, src: this.subtitleLink};
        let obj = this.subtitleLinks.find(x => x.srclang === this.comboboxValue);
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

    // internationalLabel makes sure the subtitle selection on the video is always in English regardless of user language in Salesforce
    comboboxValue = '';
    get comboboxOptions() {
        return [
            { label: NORWEGIAN_LABEL, value: 'no', internationalLabel: 'Norwegian' },
            { label: ENGLISH_LABEL, value: 'en', internationalLabel: 'English' },
            { label: POLISH_LABEL, value: 'pl', internationalLabel: 'Polish' },
        ];
    }

    handleComboboxChange(event) {
        this.comboboxValue = event.detail.value;
        this.subtitleLink = '';
    }

    showSaveToast(status) {
        const evt = new ShowToastEvent({
            message: status === 'success' ? SAVE_SUCCESS : SAVE_FAIL,
            variant: status,
            mode: 'pester'
        });
        this.dispatchEvent(evt);
    }
}