public with sharing class NKS_VideoPlayerCtrl {

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
