@isTest
public class NKS_VideoPlayerCtrl_Test {
    private static final String VIDEOTITLE = 'TEST VIDEO';
    @TestSetup
    static void makeData() {
        ContentVersion videoCv = new ContentVersion(
            Title = VIDEOTITLE,
            PathOnClient = 'testVid.mp4',
            VersionData = Blob.valueOf('123TEST'),
            NKS_Subtitle_Links__c = '[{"srclang":"no","languageLabel":"Norwegian","src":"testlink/0693O000002w0YWQAY"},{"srclang":"en","languageLabel":"English","src":"testlink/0693O000002w0YRQAY"},{"srclang":"pl","languageLabel":"Polish","src":"testlink/0693O000002w0YSQAY"}]'
        );
        insert videoCv;
        insert new ContentVersion(
            Title = 'TEST SUBTITLE',
            PathOnClient = 'testSub.vtt',
            VersionData = Blob.valueOf('123TEST')
        );
        insert new ContentVersion(
            Title = 'TEST SUBTITLE2',
            PathOnClient = 'testSub.vtt',
            VersionData = Blob.valueOf('123TEST')
        );
        insert new ContentVersion(
            Title = 'TEST SUBTITLE3',
            PathOnClient = 'testSub.vtt',
            VersionData = Blob.valueOf('123TEST')
        );
        insert new ContentVersion(
            Title = 'TEST THUMBNAIL',
            PathOnClient = 'testThumbnail.png',
            VersionData = Blob.valueOf('123TEST')
        );
        ContentVersion subtitle = [SELECT ContentDocumentId FROM ContentVersion WHERE Title = 'TEST SUBTITLE' LIMIT 1];
        ContentVersion subtitle2 = [SELECT ContentDocumentId FROM ContentVersion WHERE Title = 'TEST SUBTITLE2' LIMIT 1];
        ContentVersion subtitle3 = [SELECT ContentDocumentId FROM ContentVersion WHERE Title = 'TEST SUBTITLE3' LIMIT 1];
        videoCv.NKS_Subtitle_Links__c = '[{"srclang":"no","languageLabel":"Norwegian","src":"testlink/' + subtitle.ContentDocumentId + '"},{"srclang":"en","languageLabel":"English","src":"testlink/' + subtitle2.ContentDocumentId + '"},{"srclang":"pl","languageLabel":"Polish","src":"testlink/' + subtitle3.ContentDocumentId + '"}]';
        update videoCv;
    }

    @isTest
    static void testGetLibraryUrl() {
        Test.startTest();
        String url = NKS_VideoPlayerCtrl.getLibraryUrl('213TEST');
        Test.stopTest();

        System.assert(String.isBlank(url));
    }

    @isTest
    static void testCreateVideoTrack() {
        Test.startTest();
        NKS_VideoPlayerCtrl.VideoTrack track = new NKS_VideoPlayerCtrl.VideoTrack('no', 'Norwegian', 'src');
        Test.stopTest();

        System.assertNotEquals(null, track);
    }

    @isTest
    static void testGetVideoStats() {
        Test.startTest();
        NKS_VideoPlayerCtrl.addViewCount('12345TEST');
        NKS_VideoPlayerCtrl.addViewCount('12345TEST');
        Test.stopTest();
        ReportingData__c vidView = [SELECT Id FROM ReportingData__c WHERE NKS_Video_Id__c != NULL LIMIT 1];
        Test.setCreatedDate(vidView.Id, Date.today().addDays(-1));
        NKS_VideoPlayerCtrl.VideoStats stats = NKS_VideoPlayerCtrl.getVideoStats('12345TEST');

        System.assertEquals(2, stats.numViewsTotal);
    }

    @isTest
    static void testGetVideoTracksInternally() {
        String videoId = [SELECT ContentDocumentId FROM ContentVersion WHERE Title = :VIDEOTITLE LIMIT 1]
        ?.ContentDocumentId;

        Test.startTest();
        List<NKS_VideoPlayerCtrl.VideoTrack> tracks = NKS_VideoPlayerCtrl.getVideoTracksInternally(videoId);
        Test.stopTest();

        System.assertEquals(3, tracks.size());
    }

    @isTest
    static void testGetVideoTracks() {
        String videoId = [SELECT ContentDocumentId FROM ContentVersion WHERE Title = :VIDEOTITLE LIMIT 1]
        ?.ContentDocumentId;

        Test.startTest();
        List<NKS_VideoPlayerCtrl.VideoTrack> tracks = NKS_VideoPlayerCtrl.getVideoTracks(videoId);
        Test.stopTest();

        System.assertEquals(3, tracks.size());
    }
    
    @isTest
    static void testGetVideoTitle() {
        String videoId = [SELECT ContentDocumentId FROM ContentVersion WHERE Title = :VIDEOTITLE LIMIT 1]
        ?.ContentDocumentId;

        Test.startTest();
        String videoTitle = NKS_VideoPlayerCtrl.getVideoTitle(videoId);
        Test.stopTest();

        System.assertEquals(VIDEOTITLE, videoTitle);
    }

    @isTest
    static void testIsSandbox() {
        List<Organization> res = [SELECT IsSandbox, TrialExpirationDate FROM Organization LIMIT 1];
        Boolean isSandboxQuery = res[0].IsSandbox && res[0].TrialExpirationDate == null;

        Test.startTest();
        Boolean isSandbox = NKS_VideoPlayerCtrl.isSandbox();
        Test.stopTest();
    
        System.assertEquals(isSandboxQuery, isSandbox);
    }

    @isTest
    static void testSetThumbnailLink() {
        ContentVersion video = [SELECT ContentDocumentId, Title FROM ContentVersion WHERE Title = :VIDEOTITLE LIMIT 1];

        Test.startTest();
        NKS_VideoPlayerCtrl.setThumbnailLink(video.ContentDocumentId, 'testlink');
        Test.stopTest();
    
        video = [SELECT NKS_Thumbnail_Link__c, Title FROM ContentVersion WHERE Title = :VIDEOTITLE LIMIT 1];

        System.assertEquals(VIDEOTITLE, video.Title);
        System.assertEquals('testlink', video.NKS_Thumbnail_Link__c);
    }

    @isTest
    static void testGetStoredThumbnailLinkEmbed() {
        String videoId = [SELECT ContentDocumentId FROM ContentVersion WHERE Title = :VIDEOTITLE LIMIT 1]
        ?.ContentDocumentId;
        NKS_VideoPlayerCtrl.setThumbnailLink(videoId, 'testlink');

        Test.startTest();
        String thumbnailLink = NKS_VideoPlayerCtrl.getStoredThumbnailLink(videoId, 'Embed', 'windowOrigin');
        Test.stopTest();
        
        System.assertNotEquals('err', thumbnailLink);
    }

    @isTest
    static void testGetStoredThumbnailLinkStandard() {
        String videoId = [SELECT ContentDocumentId FROM ContentVersion WHERE Title = :VIDEOTITLE LIMIT 1]
        ?.ContentDocumentId;
        NKS_VideoPlayerCtrl.setThumbnailLink(videoId, 'testlink');

        Test.startTest();
        String thumbnailLink = NKS_VideoPlayerCtrl.getStoredThumbnailLink(videoId, 'Standard', 'windowOrigin');
        Test.stopTest();
        
        System.assertNotEquals('err', thumbnailLink);
    }

    @isTest
    static void testGetStoredThumbnailLinkExperience() {
        String videoId = [SELECT ContentDocumentId FROM ContentVersion WHERE Title = :VIDEOTITLE LIMIT 1]
        ?.ContentDocumentId;
        NKS_VideoPlayerCtrl.setThumbnailLink(videoId, 'testlink');

        Test.startTest();
        String thumbnailLink = NKS_VideoPlayerCtrl.getStoredThumbnailLink(videoId, 'Experience', 'windowOrigin');
        Test.stopTest();
        
        System.assertNotEquals('err', thumbnailLink);
    }

    @isTest
    static void testGetThumbnailLinkOnFile() {
        ContentVersion cv = [SELECT NKS_Thumbnail_Link__c, ContentDocumentId FROM ContentVersion WHERE Title = :VIDEOTITLE LIMIT 1];
        cv.NKS_Thumbnail_Link__c = 'TEST LINK';
        update cv;

        Test.startTest();
        String thumbnailLink = NKS_VideoPlayerCtrl.getThumbnailLinkOnFile(cv.ContentDocumentId);
        Test.stopTest();

        System.assertEquals('TEST LINK', thumbnailLink);
    }

    @isTest
    static void testCheckFileType() {
        String videoId = [SELECT ContentDocumentId FROM ContentVersion WHERE Title = :VIDEOTITLE LIMIT 1]
        ?.ContentDocumentId;

        Test.startTest();
        String fileType = NKS_VideoPlayerCtrl.checkFileType(videoId);
        Test.stopTest();

        System.assertEquals('mp4', fileType);
    }

    @isTest
    static void testGetSubtitleLanguageLinksOnFile() {
        String videoId = [SELECT ContentDocumentId FROM ContentVersion WHERE Title = :VIDEOTITLE LIMIT 1]
        ?.ContentDocumentId;

        Test.startTest();
        String jsonString = NKS_VideoPlayerCtrl.getSubtitleLanguageLinksOnFile(videoId);
        Test.stopTest();
        
        System.assertNotEquals(null, jsonString);
        System.assertNotEquals('[]', jsonString);
    }

    @isTest
    static void testSaveSubtitleLanguageLinks() {
        ContentVersion cv = [SELECT Id FROM ContentVersion WHERE Title = :VIDEOTITLE LIMIT 1];

        Test.startTest();
        NKS_VideoPlayerCtrl.saveSubtitleLanguageLinks('[{JSON: "testJson"}]', cv.Id);
        Test.stopTest();

        cv = [SELECT NKS_Subtitle_Links__c FROM ContentVersion WHERE Title = :VIDEOTITLE LIMIT 1];
        
        System.assertEquals('[{JSON: "testJson"}]', cv.NKS_Subtitle_Links__c);
    }

    @isTest
    static void testShowVideoTrackURL() {
        String videoId = [SELECT ContentDocumentId FROM ContentVersion WHERE Title = :VIDEOTITLE LIMIT 1]
        ?.ContentDocumentId;

        Test.startTest();
        String videoTrackUrl = NKS_VideoPlayerCtrl.showVideoTrackURL(videoId);
        Test.stopTest();

        System.assertNotEquals(null, videoTrackUrl);
    }

    @isTest
    static void testGetContentVersionIdOnContentDocument(){
        String videoId = [SELECT ContentDocumentId FROM ContentVersion WHERE Title = :VIDEOTITLE LIMIT 1]
        ?.ContentDocumentId;

        Test.startTest();
        String cvId = NKS_VideoPlayerCtrl.getContentVersionIdOnContentDocument(videoId);
        Test.stopTest();
        
        System.assertNotEquals(null, cvId);
    }
}
