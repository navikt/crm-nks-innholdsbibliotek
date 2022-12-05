@isTest
public class NKS_VideoPlayerCtrl_Test {

    @isTest
    static void testGetLibraryUrl() {
        Test.startTest();
        String url = NKS_VideoPlayerCtrl.getLibraryUrl();
        Test.stopTest();

        System.assert(String.isBlank(url));
    }
}
