public with sharing class NKS_VideoPlayerCtrl {

    @AuraEnabled
    public static VideoStats getVideoStats(String videoId){
        try {
            Integer numViewsTotal = 0, numViewsToday = 0, numViewsYesterday = 0;
            Date today = Date.today();
            Date yesterday = today.addDays(-1);

            numViewsTotal = [SELECT count() FROM ReportingData__c WHERE NKS_Video_Id__c =: videoId];
            List<AggregateResult> aggRes = [SELECT COUNT_DISTINCT(Id) numViews, DAY_ONLY(CreatedDate) viewDate FROM ReportingData__c WHERE NKS_Video_Id__c =: videoId AND CreatedDate = LAST_N_DAYS:2 GROUP BY DAY_ONLY(CreatedDate)];
            System.debug(aggRes);
            for (AggregateResult agg : aggRes) {
                if(agg.get('viewDate') == today) {
                    numViewsToday = Integer.valueOf(agg.get('numViews'));
                }
                else if(agg.get('viewDate') == yesterday) {
                    numViewsYesterday = Integer.valueOf(agg.get('numViews'));
                }
            }
            return new VideoStats(numViewsTotal, numViewsToday, numViewsYesterday);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static void addViewCount(String videoId){
        reportView(videoId);
    }

    @future
    private static void reportView(String videoId) {
        insert as system new ReportingData__c(CRM_Category__c = 'Video View', NKS_Video_Id__c = videoId);
    }

    @AuraEnabled(cacheable=true)
    public static String getLibraryUrl(String recordId){
            String communityId = [SELECT Id FROM Network WHERE Name = 'Innholdsbibliotek' LIMIT 1]?.Id;
            String communityUrl = String.isBlank(communityId) ? '' : Network.getLoginUrl(communityId);
            return communityUrl.removeEnd(communityUrl.substringAfterLast('/')) + getParentFolderName(recordId).toLowerCase() + '/' + recordId;
    }

    /**
     * @description Query the name of the parent folder for making complete library url
     * @param recordId 
     * @return  `String`
     */
    private static String getParentFolderName(String recordId) {
        return [SELECT Id, ParentContentFolder.Name FROM ContentFolderItem WHERE Id =: recordId LIMIT 1]?.ParentContentFolder?.Name; 
    }

    public class VideoStats {
        @AuraEnabled
        public Integer numViewsTotal;
        @AuraEnabled
        public Integer numViewsToday;
        @AuraEnabled
        public Integer numViewsYesterday;

        public VideoStats(Integer numViewsTotal, Integer numViewsToday, Integer numViewsYesterday) {
            this.numViewsToday = numViewsToday;
            this.numViewsTotal = numViewsTotal;
            this.numViewsYesterday = numViewsYesterday;
        }
    }
}
