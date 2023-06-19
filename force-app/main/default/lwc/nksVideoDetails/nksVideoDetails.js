import { LightningElement, api, wire } from 'lwc';
import getFileType from '@salesforce/apex/NKS_VideoPlayerCtrl.checkFileType';

export default class NksVideoDetails extends LightningElement {
    @api recordId;
    isFileTypeMp4 = false;
    isSubtitleFile = false;
    videoFileTypes = ['mp4', 'mov', 'avi', 'wmv', 'flv', 'avchd'];
    subtitleFileTypes = ['vtt']; // Does not support .srt at the moment
    @wire(getFileType, { recordId: '$recordId'})
    wiredGetFileType(result) {
        if (result.error) {
            console.log(result.error);
        } else if (result.data) {
            this.isFileTypeMp4 = this.videoFileTypes.includes(result.data);
            this.isSubtitleFile = this.subtitleFileTypes.includes(result.data);
        }
    }
}
