ContentWorkspace  workspace = [SELECT Id from ContentWorkspace where Name = 'Innholdsbibliotek' LIMIT 1];
PermissionSet extLibPermSet = [SELECT Id FROM PermissionSet WHERE Name = 'NKS_Asset_Library_Experience'];
User libraryUser = [SELECT Id FROM User WHERE Name LIKE 'Innhold%' LIMIT 1];
insert new PermissionSetAssignment(PermissionSetId = extLibPermSet.Id, AssigneeId = libraryUser.Id);

//Grant library user read access to the library
ContentWorkspacePermission workspacePermission = [SELECT Id FROM ContentWorkspacePermission WHERE Name = 'Viewer'];
insert new ContentWorkspaceMember(ContentWorkspaceId = workspace.Id, ContentWorkspacePermissionId = workspacePermission.Id, memberId = libraryUser.Id);