import { LightningElement, api, wire } from 'lwc';
import setThumbnailLink from '@salesforce/apex/NKS_VideoPlayerCtrl.setThumbnailLink';
import getThumbnailLinkOnFile from '@salesforce/apex/NKS_VideoPlayerCtrl.getThumbnailLinkOnFile';
import getFileType from '@salesforce/apex/NKS_VideoPlayerCtrl.checkFileType';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { isVideoFile } from 'c/utils';
import label from 'c/utils';

export default class NksThumbnailGenerator extends LightningElement {
    @api recordId;
    label = label;

    filetype;
    @wire(getFileType, { recordId: '$recordId'})
    wiredGetFileType(result) {
        if (result.error) {
            console.log(result.error);
        } else if (result.data) {
            this.filetype = result.data;
        }
    }

    @wire(getThumbnailLinkOnFile, { videoId: '$recordId' })
    wiredGetThumbnailLinkOnFile(result) {
        if (result.error) {
            console.error(result.error);
        } else if (result.data) {
            this.thumbnailLink = result.data;
        }
    }

    saveThumbnailLink() {
        setThumbnailLink({ videoId: this.recordId, thumbnailLink: this.thumbnailLink }).then(() => {
            this.showSaveToast('success');
        }).catch(err => {
            console.error(err);
            this.showSaveToast('error');
        });
        
    }

    thumbnailLink;
    handleInputChange(event) {
        this.thumbnailLink = event.detail.value;
    }

    showSaveToast(status) {
        const evt = new ShowToastEvent({
            message: status === 'success' ? label.THUMBNAIL_SAVE : label.SAVE_FAIL,
            variant: 'success',
            mode: 'pester'
        });
        this.dispatchEvent(evt);
    }

    get isVideoFile() {
        return isVideoFile(this.filetype);
    }
}