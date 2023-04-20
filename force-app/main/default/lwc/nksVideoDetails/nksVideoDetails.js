import { LightningElement, api, wire } from 'lwc';
import getFileType from '@salesforce/apex/NKS_VideoPlayerCtrl.checkFileType';

export default class NksVideoDetails extends LightningElement {
    @api recordId;
    fileType = false;

    @wire(getFileType, { recordId: '$recordId'})
    wiredGetFileType(result) {
        console.log('hello');
        if (result.error) {
            console.log(result.error);
        } else if (result.data) {
            this.fileType = result.data === 'mp4';
        }
    }
}
