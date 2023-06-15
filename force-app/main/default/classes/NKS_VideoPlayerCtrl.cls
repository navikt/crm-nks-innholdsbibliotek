public with sharing class NKS_VideoPlayerCtrl {
    @AuraEnabled
    public static VideoStats getVideoStats(String videoId){
        Integer numViewsTotal = 0, numViewsToday = 0, numViewsYesterday = 0;
        Date today = Date.today();
        Date yesterday = today.addDays(-1);

        numViewsTotal = [SELECT count() FROM ReportingData__c WHERE NKS_Video_Id__c =: videoId];
        List<AggregateResult> aggRes = [SELECT COUNT_DISTINCT(Id) numViews, DAY_ONLY(CreatedDate) viewDate FROM ReportingData__c WHERE NKS_Video_Id__c =: videoId AND CreatedDate = LAST_N_DAYS:2 GROUP BY DAY_ONLY(CreatedDate)];
        for (AggregateResult agg : aggRes) {
            if(agg.get('viewDate') == today) {
                numViewsToday = Integer.valueOf(agg.get('numViews'));
            }
            else if(agg.get('viewDate') == yesterday) {
                numViewsYesterday = Integer.valueOf(agg.get('numViews'));
            }
        }
        return new VideoStats(numViewsTotal, numViewsToday, numViewsYesterday);
    }

    @AuraEnabled(cacheable=true) 
    public static Boolean isSandbox() {
        List<Organization> res = [SELECT IsSandbox, TrialExpirationDate FROM Organization LIMIT 1];
        return res[0].IsSandbox && res[0].TrialExpirationDate == null;
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
    public static String checkFileType(String recordId) {
        return [SELECT FileExtension FROM ContentDocument WHERE Id = :recordId LIMIT 1]?.FileExtension;
    }

    /**
    * @description Generate library url for a unique video
    * @param recordId 
    * @return  `String`
    */
    @AuraEnabled(cacheable=true)
    public static String getLibraryUrl(String recordId) {
        String communityUrl = getLibraryBaseUrl();
        return String.isNotBlank(communityUrl) ?
            getParentFolderName(recordId) != null ?
                communityUrl + getParentFolderName(recordId).toLowerCase() + '/' + recordId
                : '' 
            : '';
    }

    /**
     * @description Get the community url for the asset library
     * @return  `String`
     */
    @AuraEnabled(cacheable=true)
    public static String getLibraryBaseUrl() {
        String communityId = [SELECT Id FROM Network WHERE Name = 'Innholdsbibliotek' LIMIT 1]?.Id;
        String communityUrl = String.isBlank(communityId) ? '' : Network.getLoginUrl(communityId);
        return String.isNotBlank(communityUrl) ? communityUrl.removeEnd(communityUrl.substringAfterLast('/')) : '';
    }

    /**
     * @description Returns a list of video tracks related to a content document video file
     * Used for embedding to get around bug with Lightning Out and CORS on tracks related to a video
     * @param recordId 
     * @return  `List<VideoTrack>`
     */
    @AuraEnabled(cacheable=true)
    public static List<VideoTrack> getVideoTracks(String videoId) {
        List<VideoTrack> subTracks = new List<VideoTrack>();
        for (ContentVersion subTrack : [SELECT Id, ContentDocumentId, VersionData, NKS_Subtitle_Language__c, toLabel(NKS_Subtitle_Language__c) languageLabel FROM ContentVersion WHERE NKS_Related_Video__c =: videoId AND IsLatest = true]) {
            Blob fileBody = subTrack.VersionData;
            String versionDataAsString = fileBody.toString();
            subTracks.add(new VideoTrack(subTrack.NKS_Subtitle_Language__c, (String)subTrack.get('languageLabel'), versionDataAsString));
        }
        return subTracks;
    }

    /**
     * @description Returns a list of video tracks related to a content document video file
     * Used inside Salesforce and on Experience Site
     * @param recordId 
     * @return  `List<VideoTrack>`
     */
    @AuraEnabled(cacheable=true)
    public static List<VideoTrack> getVideoTracksInternally(String videoId) {
        String src, baseUrl;
        List<VideoTrack> subTracks = new List<VideoTrack>();
        Boolean isGuest = Auth.CommunitiesUtil.isGuestUser();
        baseUrl = isGuest ? getLibraryBaseUrl() : Url.getSalesforceBaseUrl().toExternalForm();
        for (ContentVersion subTrack : [SELECT Id, ContentDocumentId, NKS_Subtitle_Language__c, toLabel(NKS_Subtitle_Language__c) languageLabel FROM ContentVersion WHERE NKS_Related_Video__c =: videoId AND IsLatest = true]) {
            src = isGuest ? 
                baseUrl.replace('/s', '') + 'sfsites/c/sfc/servlet.shepherd/document/download/' + subTrack.ContentDocumentId : 
                baseUrl.replace('/s', '') + '/sfc/servlet.shepherd/document/download/' + subTrack.ContentDocumentId;
            subTracks.add(new VideoTrack(subTrack.NKS_Subtitle_Language__c, (String)subTrack.get('languageLabel'), src));
        }
        return subTracks;
    }

    /**
     * @description Returns the title of the video file
     * @param recordId 
     * @return  `String`
     */
    @AuraEnabled(cacheable=true)
    public static String getVideoTitle(String videoId) {
        String cvTitle = [SELECT Title FROM ContentVersion WHERE ContentDocumentId =: videoId LIMIT 1]?.Title;
        return cvTitle != null ? cvTitle : 'Video mangler tittel';
    }

    /**
     * @description Query the name of the parent folder for making complete library url
     * @param recordId 
     * @return  `String`
     */
    private static String getParentFolderName(String recordId) {
        return [SELECT Id, ParentContentFolder.Name FROM ContentFolderItem WHERE Id =: recordId LIMIT 1]?.ParentContentFolder?.Name; 
    }

    public class VideoTrack {
        @AuraEnabled
        public String srclang;
        @AuraEnabled
        public String languageLabel;
        @AuraEnabled
        public String src;

        public VideoTrack(String srclang, String languageLabel, String src) {
            this.src = src;
            this.srclang = srclang;
            this.languageLabel = languageLabel;
        }
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

    @AuraEnabled
    public static void setThumbnailLink(String videoId, String thumbnailLink) {
        ContentVersion cv = [SELECT Id, NKS_Thumbnail_Link__c FROM ContentVersion WHERE ContentDocumentId = :videoId LIMIT 1];
        cv.NKS_Thumbnail_Link__c = thumbnailLink;
        update cv;
    }

    /*  
        Used in aura helper class to generate video HTML code. Cachable = false to instantly see changed thumbnail on refresh
        - env: Standard (Inside Salesforce) - window.location.origin + '/sfc/servlet.shepherd/document/download/' + recordId
        - env: Experience (On Experience Page) - window.location.origin + '/sfsites/c/sfc/servlet.shepherd/document/download/' + recordId
        - env: Embed (Embedded) - experienceSiteURL.replace('/s/', '') + '/sfsites/c/sfc/servlet.shepherd/document/download/' + recordId
    */
    @AuraEnabled(cacheable=false)
    public static String getStoredThumbnailLink(String videoId, String env, String windowOrigin) {
        String thumbnailLink = [SELECT NKS_Thumbnail_Link__c FROM ContentVersion WHERE ContentDocumentId = :videoId LIMIT 1]?.NKS_Thumbnail_Link__c;
        
        String recordId;
        if (thumbnailLink != null) {
            List<String> splitThumbnail = thumbnailLink.split('/');
            recordId = splitThumbnail[splitThumbnail.size() - 1]; // Record id of Thumbnail record
        }

        final Map<String, String> allowedEnvs = new Map<String, String>{
            'Standard' => thumbnailLink,
            'Experience' => windowOrigin + (NKS_VideoPlayerCtrl.isSandbox() == true ? '/ihb/sfsites/c/sfc/servlet.shepherd/document/download/' : '/sfsites/c/sfc/servlet.shepherd/document/download/') + recordId,
            'Embed' => NKS_VideoPlayerCtrl.getLibraryBaseUrl().replace('/s/', '') + '/sfsites/c/sfc/servlet.shepherd/document/download/' + recordId
        };
        if (allowedEnvs.get(env) == null || recordId == null) {
            return 'err';
        }
        return allowedEnvs.get(env);
    }

    // Used on record page in wire
    @AuraEnabled(cacheable=true)
    public static String getThumbnailLinkOnFile(String videoId) {
        return [SELECT NKS_Thumbnail_Link__c FROM ContentVersion WHERE ContentDocumentId = :videoId LIMIT 1]?.NKS_Thumbnail_Link__c;
    }

    // Used on record page in wire
    @AuraEnabled(cacheable=true)
    public static ContentVersion getSubtitleLanguageLinksOnFile(String videoId) {
        return [SELECT NKS_Subtitle_Link_Norwegian__c, NKS_Subtitle_Link_English__c, NKS_Subtitle_Link_Polish__c FROM ContentVersion WHERE ContentDocumentId = :videoId LIMIT 1];
    }

    @AuraEnabled
    public static void saveSubtitleLanguageLinks(ContentVersion cvObj) {
        ContentVersion cv = new ContentVersion(Id = cvObj.Id, NKS_Subtitle_Link_Norwegian__c = cvObj.NKS_Subtitle_Link_Norwegian__c, NKS_Subtitle_Link_English__c = cvObj.NKS_Subtitle_Link_English__c, NKS_Subtitle_Link_Polish__c = cvObj.NKS_Subtitle_Link_Polish__c);
        update cv;
    }
}
