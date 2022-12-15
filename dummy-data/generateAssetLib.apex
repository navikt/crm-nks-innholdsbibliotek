ContentWorkspace  workspace = [SELECT Id from ContentWorkspace where Name = 'Innholdsbibliotek' LIMIT 1];
String workspaceFolder = [SELECT Id, Name FROM ContentFolder WHERE Name =: workspace.Id LIMIT 1]?.Id;

List<ContentFolder> folders = new List<ContentFolder>();
folders.add(new ContentFolder(Name = 'Arbeid', ParentContentFolderId = workspaceFolder));
folders.add(new ContentFolder(Name = 'Pensjon', ParentContentFolderId = workspaceFolder));
folders.add(new ContentFolder(Name = 'Familie', ParentContentFolderId = workspaceFolder));
folders.add(new ContentFolder(Name = 'Helse', ParentContentFolderId = workspaceFolder));

insert folders;

PermissionSet extLibPermSet = [SELECT Id FROM PermissionSet WHERE Name = 'NKS_Asset_Library_Experience'];
User libraryUser = [SELECT Id FROM User WHERE Name LIKE 'Innhold%' LIMIT 1];
insert new PermissionSetAssignment(PermissionSetId = extLibPermSet.Id, AssigneeId = libraryUser.Id);