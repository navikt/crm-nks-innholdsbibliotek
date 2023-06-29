import { LightningElement, wire, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getFileType from '@salesforce/apex/NKS_VideoPlayerCtrl.checkFileType';
import getSubtitleLanguageLinksOnFile from '@salesforce/apex/NKS_VideoPlayerCtrl.getSubtitleLanguageLinksOnFile';
import saveSubtitleLanguageLinks from '@salesforce/apex/NKS_VideoPlayerCtrl.saveSubtitleLanguageLinks';
import getContentVersionIdOnContentDocument from '@salesforce/apex/NKS_VideoPlayerCtrl.getContentVersionIdOnContentDocument';
import { isVideoFile } from 'c/utils';
import { refreshApex } from '@salesforce/apex';
import NORWEGIAN_LABEL from '@salesforce/label/c.NKS_Subtitle_Language_Norwegian';
import ENGLISH_LABEL from '@salesforce/label/c.NKS_Subtitle_Language_English';
import POLISH_LABEL from '@salesforce/label/c.NKS_Subtitle_Language_Polish';
import DELETE from '@salesforce/label/c.NKS_Button_Delete';
import SAVE from '@salesforce/label/c.NKS_Button_Save';
import LANGUAGE from '@salesforce/label/c.NKS_Subtitle_Column_Header';
import LINK from '@salesforce/label/c.NKS_Subtitle_Link';
import SAVE_SUCCESS from '@salesforce/label/c.NKS_Save_Message_Success';
import SAVE_FAIL from '@salesforce/label/c.NKS_Save_Message_Fail';
import SUBTITLE_WARNING from '@salesforce/label/c.NKS_Subtitle_Warning';
import SUBTITLE_COMBOBOX_PLACEHOLDER from '@salesforce/label/c.NKS_Subtitle_Combobox_Placeholder';
import SUBTITLE_PLACEHOLDER from '@salesforce/label/c.NKS_Subtitle_Placeholder';
import SUBTITLE_LINK from '@salesforce/label/c.NKS_Subtitle_Link'; 
import SUBTITLE_HEADER from '@salesforce/label/c.NKS_Subtitles';



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

    labels = {
        SAVE,
        SUBTITLE_WARNING,
        SUBTITLE_COMBOBOX_PLACEHOLDER,
        SUBTITLE_PLACEHOLDER,
        SUBTITLE_LINK,
        SUBTITLE_HEADER
    };

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

        //TODO: Before saving - always set labels to english
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