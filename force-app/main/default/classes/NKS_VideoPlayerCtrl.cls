public with sharing class NKS_VideoPlayerCtrl {

    @AuraEnabled(cacheable=true)
    public static string getVideoUrl(String videoRef){
        try {
            //Query the content distribution link 
            String latestVersionId = [SELECT Id, LatestPublishedVersionId FROM ContentDocument WHERE Id =: videoRef]?.LatestPublishedVersionId;
            return [SELECT Id, ContentDownloadUrl FROM ContentDistribution  WHERE ContentVersionId =: latestVersionId LIMIT 1]?.ContentDownloadUrl;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}
