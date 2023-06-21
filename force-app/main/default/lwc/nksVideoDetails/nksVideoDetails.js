import { LightningElement, api, wire } from 'lwc';
import getFileType from '@salesforce/apex/NKS_VideoPlayerCtrl.checkFileType';

export default class NksVideoDetails extends LightningElement {
    @api recordId;
    isVideoFile = false;
    videoFileTypes = ['mp4', 'mov', 'avi', 'wmv', 'flv', 'avchd'];
    @wire(getFileType, { recordId: '$recordId'})
    wiredGetFileType(result) {
        if (result.error) {
            console.log(result.error);
        } else if (result.data) {
            this.isVideoFile = this.videoFileTypes.includes(result.data);
        }
    }
}
