import { LightningElement, wire, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getFileType from '@salesforce/apex/NKS_VideoPlayerCtrl.checkFileType';
import getSubtitleLanguageLinksOnFile from '@salesforce/apex/NKS_VideoPlayerCtrl.getSubtitleLanguageLinksOnFile';
import saveSubtitleLanguageLinks from '@salesforce/apex/NKS_VideoPlayerCtrl.saveSubtitleLanguageLinks';
import getContentVersionIdOnContentDocument from '@salesforce/apex/NKS_VideoPlayerCtrl.getContentVersionIdOnContentDocument';
import { isVideoFile } from 'c/utils';
import { refreshApex } from '@salesforce/apex';
import label from 'c/utils';

const columns = [
    { label: label.LANGUAGE, fieldName: 'languageLabel' },
    { label: label.LINK, fieldName: 'src' },
    {
        type: "button", initialWidth: 110, typeAttributes: {
            label: label.DELETE,
            name: label.DELETE,
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
            // Convert languageLabel to translated version on load
            if (this.subtitleLinks.length > 0) {
                this.subtitleLinks = this.subtitleLinks.map((x) => ({ ...x, languageLabel: this.comboboxOptions.find(y => y.value === x.srclang)?.label }));
            }
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
        let data = {srclang: this.comboboxValue, languageLabel: this.comboboxOptions.find(x => x.value === this.comboboxValue)?.label, src: this.subtitleLink};
        let obj = this.subtitleLinks.find(x => x.srclang === this.comboboxValue);
        // Replace if language already exists in list
        if (obj !== undefined) {
            Object.assign(obj, data);
        } else {
            this.subtitleLinks.push(data);
        }
        // Convert language to international label before save
        this.subtitleLinks = this.subtitleLinks.map((x) => ({ ...x, languageLabel: this.comboboxOptions.find(y => y.value === x.srclang)?.internationalLabel }));
        
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
            { label: label.NORWEGIAN_LABEL, value: 'no', internationalLabel: 'Norwegian' },
            { label: label.ENGLISH_LABEL, value: 'en', internationalLabel: 'English' },
            { label: label.POLISH_LABEL, value: 'pl', internationalLabel: 'Polish' },
        ];
    }

    handleComboboxChange(event) {
        this.comboboxValue = event.detail.value;
        this.subtitleLink = '';
    }

    showSaveToast(status) {
        const evt = new ShowToastEvent({
            message: status === 'success' ? label.SAVE_SUCCESS : label.SAVE_FAIL,
            variant: status,
            mode: 'pester'
        });
        this.dispatchEvent(evt);
    }
}