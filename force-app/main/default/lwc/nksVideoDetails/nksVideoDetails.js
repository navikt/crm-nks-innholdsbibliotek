import { LightningElement, api, wire } from 'lwc';
import getFileType from '@salesforce/apex/NKS_VideoPlayerCtrl.checkFileType';
import { isVideoFile } from 'c/utils';

export default class NksVideoDetails extends LightningElement {
    @api recordId;
    isVideoFile = false;

    wiredData;
    @wire(getFileType, { recordId: '$recordId'})
    wiredGetFileType(result) {
        if (result.error) {
            console.log(result.error);
        } else if (result.data) {
            this.isVideoFile = isVideoFile(result.data);
            this.wiredData = result.data;
        }
    }
}