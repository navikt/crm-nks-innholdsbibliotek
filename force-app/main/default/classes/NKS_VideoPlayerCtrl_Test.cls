@isTest
public class NKS_VideoPlayerCtrl_Test {
    @TestSetup
    static void makeData() {
        // Insert video file
        ContentVersion cv = new ContentVersion(
            Title = 'TEST VIDEO',
            PathOnClient = 'testVid.mp4',
            VersionData = Blob.valueOf('123TEST')
        );
        insert cv;

        // Insert subtitle file
        ContentDocument conDoc = [SELECT Id FROM ContentDocument LIMIT 1];
        insert new ContentVersion(
            Title = 'TEST SUBTITLE',
            PathOnClient = 'testSub.vtt',
            NKS_Related_Video__c = conDoc.Id,
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
        ReportingData__c vidView = [SELECT id FROM ReportingData__c WHERE NKS_Video_Id__c != NULL LIMIT 1];
        Test.setCreatedDate(vidView.Id, Date.today().addDays(-1));
        NKS_VideoPlayerCtrl.VideoStats stats = NKS_VideoPlayerCtrl.getVideoStats('12345TEST');

        System.assertEquals(2, stats.numViewsTotal);
    }

    @isTest
    static void testGetVideoTracks() {
        String videoId = [SELECT Id, ContentDocumentId FROM ContentVersion WHERE NKS_Related_Video__c = NULL LIMIT 1]
        ?.ContentDocumentId;

        Test.startTest();
        List<NKS_VideoPlayerCtrl.VideoTrack> tracks = NKS_VideoPlayerCtrl.getVideoTracks(videoId);
        Test.stopTest();

        System.assertEquals(1, tracks.size());
    }
    
    @isTest
    static void testGetVideoTitle() {
        String videoId = [SELECT Id, ContentDocumentId FROM ContentVersion WHERE NKS_Related_Video__c = NULL LIMIT 1]
        ?.ContentDocumentId;

        Test.startTest();
        String videoTitle = NKS_VideoPlayerCtrl.getVideoTitle(videoId);
        Test.stopTest();

        System.assertEquals('TEST VIDEO', videoTitle);
    }

    @isTest
    static void testInsertSubtitleFilesWithExistingSubtitleFolder(){
        NKS_VideoPlayerCtrl.InputVariables inputVariable = new NKS_VideoPlayerCtrl.InputVariables();
        inputVariable.recordId = [SELECT Id FROM ContentVersion WHERE Title = 'TEST VIDEO' LIMIT 1].Id; // VideoId
        inputVariable.language = 'no';
        inputVariable.subtitleFile = [SELECT Id, NKS_Content_Document_Link__c, NKS_Related_Video__c, NKS_Subtitle_Language__c, ContentDocumentId FROM ContentVersion WHERE Title = 'TEST SUBTITLE' LIMIT 1];
        ContentWorkspace ihb;
        try {
            ihb = [SELECT RootContentFolderId FROM ContentWorkspace WHERE Name = 'Innholdsbibliotek'];
        } catch (Exception e) {
            ihb = new ContentWorkspace(); 
            ihb.DeveloperName = 'Innholdsbibliotek'; 
            ihb.Name = 'Innholdsbibliotek'; 
            insert ihb;
        }
        // Create contentfolder "Subtitles"
        ContentFolder cf = new ContentFolder();
        cf.Name = 'Subtitles';
        cf.ParentContentFolderId = ihb.RootContentFolderId;
        insert cf;
        inputVariable.subtitleFolder = [SELECT Id FROM ContentFolder WHERE Name = 'Subtitles' LIMIT 1];

        Test.startTest();
        NKS_VideoPlayerCtrl.insertSubtitleFiles(new List<NKS_VideoPlayerCtrl.InputVariables>{(inputVariable)});
        Test.stopTest();
    }
}
