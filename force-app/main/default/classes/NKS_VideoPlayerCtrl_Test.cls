@isTest
public class NKS_VideoPlayerCtrl_Test {
    private static final String VIDEOTITLE = 'TEST VIDEO';
    @TestSetup
    static void makeData() {
        insert new ContentVersion(
            Title = VIDEOTITLE,
            PathOnClient = 'testVid.mp4',
            VersionData = Blob.valueOf('123TEST'),
            NKS_Subtitle_Link_Norwegian__c = 'TEST NORWEGIAN',
            NKS_Subtitle_Link_English__c = 'TEST ENGLISH',
            NKS_Subtitle_Link_Polish__c = 'TEST POLISH'
        );
        ContentDocument conDoc = [SELECT Id FROM ContentDocument LIMIT 1];

        insert new ContentVersion(
            Title = 'TEST SUBTITLE',
            PathOnClient = 'testSub.vtt',
            NKS_Related_Video__c = conDoc.Id,
            VersionData = Blob.valueOf('123TEST')
        );

        insert new ContentVersion(
            Title = 'TEST THUMBNAIL',
            PathOnClient = 'testThumbnail.png',
            VersionData = Blob.valueOf('123TEST')
        );
    }

    @isTest
    static void testGetLibraryUrl() {
        Test.startTest();
        String url = NKS_VideoPlayerCtrl.getLibraryUrl('213TEST');
        Test.stopTest();

        System.assert(String.isBlank(url));
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
    static void testGetSubtitleLanguageLinksOnFile() {
        String videoId = [SELECT ContentDocumentId FROM ContentVersion WHERE Title = :VIDEOTITLE LIMIT 1]
        ?.ContentDocumentId;

        Test.startTest();
        ContentVersion cv = NKS_VideoPlayerCtrl.getSubtitleLanguageLinksOnFile(videoId);
        Test.stopTest();
        
        System.assertNotEquals(null, cv.NKS_Subtitle_Link_Norwegian__c);
        System.assertNotEquals(null, cv.NKS_Subtitle_Link_English__c);
        System.assertNotEquals(null, cv.NKS_Subtitle_Link_Polish__c);
    }

    @isTest
    static void testSaveSubtitleLanguageLinks() {
        ContentVersion cv = [SELECT Id, NKS_Subtitle_Link_Norwegian__c, NKS_Subtitle_Link_English__c, NKS_Subtitle_Link_Polish__c FROM ContentVersion WHERE Title = :VIDEOTITLE LIMIT 1];
        cv.NKS_Subtitle_Link_Norwegian__c = 'TEST_NO';
        cv.NKS_Subtitle_Link_English__c = 'TEST_EN';
        cv.NKS_Subtitle_Link_Polish__c = 'TEST_PL';

        Test.startTest();
        NKS_VideoPlayerCtrl.saveSubtitleLanguageLinks(cv);
        Test.stopTest();

        cv = [SELECT NKS_Subtitle_Link_Norwegian__c, NKS_Subtitle_Link_English__c, NKS_Subtitle_Link_Polish__c FROM ContentVersion WHERE Title = :VIDEOTITLE LIMIT 1];
        
        System.assertEquals('TEST_NO', cv.NKS_Subtitle_Link_Norwegian__c);
        System.assertEquals('TEST_EN', cv.NKS_Subtitle_Link_English__c);
        System.assertEquals('TEST_PL', cv.NKS_Subtitle_Link_Polish__c);
    }
}
