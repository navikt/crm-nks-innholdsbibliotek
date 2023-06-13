import { LightningElement, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class NksSubtitles extends LightningElement {
    // TODO: Add through wire and get the connected subtitles on different languages where isLatest = True
    // TODO: Maybe show as a table to show name, language and file extension there? And then a button at the end with update/add
    get languages() {
        return [{Name: 'Norwegian'}, {Name: 'English'}, {Name: 'Polish'}];
    }

    /*@wire(getExistingSubtitlesOnFile, { videoId: '$recordId' })
    wiredGetExistingSubtitles(result) {
        if (result.error) {
            console.error(result.error);
        } else if (result.data) {
            //this.subtitleLink = result.data;
        }
    }*/

    saveSubtitleLink() {
        // TODO: Save subtitle link on file
        this.showSaveToast();
    }

    // TODO: Copy current iteration value in list 
    subtitleLink;
    handleInputChange(event) {
        this.subtitleLink = event.detail.value;
    }

    handleCopy() {
        navigator.clipboard.writeText(this.subtitleLink);
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

    showSaveToast() {
        const evt = new ShowToastEvent({
            message: 'Thumbnail-link lagret.',
            variant: 'success',
            mode: 'pester'
        });
        this.dispatchEvent(evt);
    }
}