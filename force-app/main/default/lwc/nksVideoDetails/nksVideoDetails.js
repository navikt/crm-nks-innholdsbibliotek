import { LightningElement, api, wire } from 'lwc';
import getFileType from '@salesforce/apex/NKS_VideoPlayerCtrl.checkFileType';

export default class NksVideoDetails extends LightningElement {
    @api recordId;
    isFileTypeMp4 = false;

    @wire(getFileType, { recordId: '$recordId'})
    wiredGetFileType(result) {
        if (result.error) {
            console.log(result.error);
        } else if (result.data) {
            this.isFileTypeMp4 = result.data === 'mp4';
        }
    }
}
