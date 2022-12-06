@isTest
public class NKS_VideoPlayerCtrl_Test {

    @isTest
    static void testGetLibraryUrl() {
        Test.startTest();
        String url = NKS_VideoPlayerCtrl.getLibraryUrl();
        Test.stopTest();

        System.assert(String.isBlank(url));
    }

    @isTest
    static void testGetVideoStats() {
        Test.startTest();
        NKS_VideoPlayerCtrl.addViewCount('12345TEST');
        Test.stopTest();
        NKS_VideoPlayerCtrl.VideoStats stats = NKS_VideoPlayerCtrl.getVideoStats('12345TEST');

        System.assertEquals(1, stats.numViewsTotal);
    }
}
