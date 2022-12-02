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

    @AuraEnabled(cacheable=true)
    public static string getLibraryUrl(){
        try {
            String communityId = [SELECT Id FROM Network WHERE Name = 'Innholdsbibliotek' LIMIT 1]?.Id;
            String communityUrl = String.isBlank(communityId) ? '' : Network.getLoginUrl(communityId);
            return communityUrl.removeEnd(communityUrl.substringAfterLast('/'));
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}
