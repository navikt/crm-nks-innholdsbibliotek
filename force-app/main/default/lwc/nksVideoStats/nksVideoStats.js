import { LightningElement, api, track } from 'lwc';
import getStats from '@salesforce/apex/NKS_VideoPlayerCtrl.getVideoStats';
import VIDEO_STATS_LABEL from '@salesforce/label/c.NKS_Video_Stats_Title';
import VIDEO_VIEWS_LABEL from '@salesforce/label/c.NKS_Video_Total_Views';
import VIDEO_VIEWS_TODAY_LABEL from '@salesforce/label/c.NKS_Video_Views_Today';

export default class NksVideoStats extends LightningElement {
    @api recordId;
    @track videoStats;
    isLoading = false;
    error = false;
    labels = {
        VIDEO_STATS_LABEL,
        VIDEO_VIEWS_LABEL,
        VIDEO_VIEWS_TODAY_LABEL
    };

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
            if (numViewsToday > numViewsYesterday) {
                trend = 'up';
            } else if (numViewsToday < numViewsYesterday) {
                trend = 'down';
            }
        }
        return trend;
    }
}
