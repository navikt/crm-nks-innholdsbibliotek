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
    public static void addViewCount(String videoId){
        reportView(videoId);
    }

    @future
    private static void reportView(String videoId) {
        insert as system new ReportingData__c(CRM_Category__c = 'Video View', NKS_Video_Id__c = videoId);
    }

    /**
    * @description Generate library url for a unique video
    * @param recordId 
    * @return  `String`
    */
    @AuraEnabled(cacheable=true)
    public static String getLibraryUrl(String recordId){
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
     * @param recordId 
     * @return  `List<VideoTrack>`
     */
    @AuraEnabled(cacheable=true)
    public static List<VideoTrack> getVideoTracks(String videoId) {
        String src, baseUrl;
        List<VideoTrack> subTracks = new List<VideoTrack>();
        Boolean isGuest = Auth.CommunitiesUtil.isGuestUser();
        baseUrl = isGuest ? getLibraryBaseUrl() : Url.getSalesforceBaseUrl().toExternalForm();
        for (ContentVersion subTrack : [SELECT Id, ContentDocumentId, NKS_Subtitle_Language__c, toLabel(NKS_Subtitle_Language__c) languageLabel FROM ContentVersion WHERE NKS_Related_Video__c =: videoId AND IsLatest = true]) {
            src = isGuest ? 
                baseUrl + 'sfsites/c/sfc/servlet.shepherd/document/download/' + subTrack.ContentDocumentId : 
                baseUrl + '/sfc/servlet.shepherd/document/download/' + subTrack.ContentDocumentId;
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

    @InvocableMethod(label='Insert Subtitle Files' description='Creates folder if not found and adds subtitle files to the folder.')
    public static List<OutputVariables> insertSubtitleFiles(List<InputVariables> inputVariables) {
        // Get subtitle folder -> create if not exists
        List<ContentFolder> subtitleFoldersToInsert = new List<ContentFolder>();
        List<ContentVersion> subtitles = new List<ContentVersion>();
        Map<Id, ContentFolder> subtitleFolderbySubtitleContentDocumentId = new Map<Id, ContentFolder>();

        for (InputVariables inputVariable : inputVariables) {
            if (inputVariable.subtitleFolder == null) {
                ContentFolder subtitleFolder = new ContentFolder(Name='Subtitles', ParentContentFolderId=inputVariable.parentFolder.ParentContentFolderId);
                subtitleFoldersToInsert.add(subtitleFolder);
                subtitleFolderbySubtitleContentDocumentId.put(inputVariable.subtitleFile.ContentDocumentId, subtitleFolder);
            } else {
                subtitleFolderbySubtitleContentDocumentId.put(inputVariable.subtitleFile.ContentDocumentId, inputVariable.subtitleFolder);
            }
            // Set content document URL and video relation on new subtitle file and update it
            inputVariable.subtitleFile.NKS_Content_Document_Link__c = '/' + inputVariable.subtitleFile.ContentDocumentId;
            inputVariable.subtitleFile.NKS_Related_Video__c = inputVariable.recordId;
            inputVariable.subtitleFile.NKS_Subtitle_Language__c = inputVariable.language;
            subtitles.add(inputVariable.subtitleFile);
        }
        insert subtitleFoldersToInsert;
        update subtitles; 

        // Get library
        ContentWorkspace ihb = [SELECT Id FROM ContentWorkspace WHERE Name = 'Innholdsbibliotek' LIMIT 1];
        
        // Create content document link based on subtitle content version
        List<ContentDocumentLink> cdlsToInsert = new List<ContentDocumentLink>();
        for (ContentVersion subtitle : subtitles) {
            ContentDocumentLink cdl = new ContentDocumentLink();
            cdl.ContentDocumentId = subtitle.ContentDocumentId;
            cdl.LinkedEntityId = ihb.Id;
            cdl.ShareType = 'I';
            cdl.Visibility = 'AllUsers';
            cdlsToInsert.add(cdl);
        }
        insert cdlsToInsert;

        // Add to subtitle folder
        List<ContentFolderMember> cfmList = [SELECT ParentContentFolderId, ChildRecordId FROM ContentFolderMember WHERE ChildRecordId IN :subtitleFolderbySubtitleContentDocumentId.keySet()];
        List<ContentFolderMember> cfmToUpdate = new List<ContentFolderMember>();
        for (ContentFolderMember cfm : cfmList) {
            if (subtitleFolderbySubtitleContentDocumentId.keySet().contains(cfm.ChildRecordId)) {
                cfm.ParentContentFolderId = subtitleFolderbySubtitleContentDocumentId.get(cfm.ChildRecordId).Id;
                cfmToUpdate.add(cfm);
            }
        }

        OutputVariables result = new OutputVariables();
        List<OutputVariables> resultList = new List<OutputVariables>();
        try {
            update cfmToUpdate;
            result.resultMessage = new List<String>{'Success!'};
            resultList.add(result);
            return resultList;
        } catch (Exception e) {
            result.resultMessage = new List<String>{(e.getMessage())};
            resultList.add(result);
            return resultList;
        }
    }

    public class InputVariables {
        @InvocableVariable
        public Id recordId;
        @InvocableVariable
        public String language;
        @InvocableVariable
        public ContentVersion subtitleFile;
        @InvocableVariable
        public ContentFolder subtitleFolder;
        @InvocableVariable
        public ContentFolderItem parentFolder;
    }

    public class OutputVariables {
        @InvocableVariable
        public List<String> resultMessage;
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
}
