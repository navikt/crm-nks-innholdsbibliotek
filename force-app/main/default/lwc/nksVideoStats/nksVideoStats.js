import { LightningElement, api, track } from 'lwc';
import getStats from '@salesforce/apex/NKS_VideoPlayerCtrl.getVideoStats';

export default class NksVideoStats extends LightningElement {
    @api recordId;
    @track videoStats;
    isLoading = false;
    error = false;

    connectedCallback() {
        this.isLoading = true;

        getStats({
            videoId: this.recordId
        })
            .then((stats) => {
                this.videoStats = stats;
            })
            .catch((error) => {
                console.error(JSON.stringify(error));
                this.error = true;
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    get arrowIcon() {
        let icon = 'utility:sort';
        if (this.trend === 'up') {
            icon = 'utility:arrowup';
        } else if (this.trend === 'down') {
            icon = 'utility:arrowdown';
        }

        return icon;
    }

    get trend() {
        let trend = '';
        if (this.videoStats) {
            const numViewsToday = this.videoStats.numViewsToday;
            const numViewsYesterday = this.videoStats.numViewsYesterday;
            console.log('VIEWS TODAY: ' + numViewsToday);
            console.log('VIEWS YESTERDAY: ' + numViewsYesterday);
            if (numViewsToday > numViewsYesterday) {
                trend = 'up';
            } else if (numViewsToday < numViewsYesterday) {
                trend = 'down';
            }
        }
        return trend;
    }
}
