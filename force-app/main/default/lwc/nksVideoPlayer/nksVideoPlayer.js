import { LightningElement, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';

export default class NksVideoPlayer extends LightningElement {
    // Declare the currentPageReference variable in order to track it
    currentPageReference;

    @wire(CurrentPageReference)
    setCurrentPageReference(currentPageReference) {
        this.currentPageReference = currentPageReference;
        this.getVideoReference();
    }

    getVideoReference() {
        //Get reference from parameters in the pagereference
    }
}
