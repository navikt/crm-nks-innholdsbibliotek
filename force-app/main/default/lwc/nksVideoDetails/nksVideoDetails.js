import { LightningElement, api, wire } from 'lwc';
import getFileType from '@salesforce/apex/NKS_VideoPlayerCtrl.checkFileType';
import { isVideoFile } from 'c/utils';

export default class NksVideoDetails extends LightningElement {
    @api recordId;
    isVideoFile = false;

    filetype = '';
    @wire(getFileType, { recordId: '$recordId'})
    wiredGetFileType(result) {
        if (result.error) {
            console.error(result.error);
        } else if (result.data) {
            this.isVideoFile = isVideoFile(result.data);
            this.filetype = result.data;
        }
    }
}