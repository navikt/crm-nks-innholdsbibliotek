public with sharing class NKS_VideoPlayerCtrl {

    @AuraEnabled
    public static string getVideoUrl(String videoRef){
        try {
            //Query ContentDocument based on an external reference name
            return '';
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}
