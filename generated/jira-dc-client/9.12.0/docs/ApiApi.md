# ApiApi

All URIs are relative to */jira/rest*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**_delete**](ApiApi.md#_delete) | **DELETE** /api/2/version/{id} |  |
| [**_delete_0**](ApiApi.md#_delete_0) | **POST** /api/2/version/{id}/removeAndSwap |  |
| [**_delete_1**](ApiApi.md#_delete_1) | **DELETE** /api/2/component/{id} |  |
| [**acknowledgeErrors**](ApiApi.md#acknowledgeerrors) | **POST** /api/2/cluster/zdu/retryUpgrade |  |
| [**addActorUsers**](ApiApi.md#addactorusers) | **POST** /api/2/project/{projectIdOrKey}/role/{id} |  |
| [**addAttachment**](ApiApi.md#addattachment) | **POST** /api/2/issue/{issueIdOrKey}/attachments |  |
| [**addComment**](ApiApi.md#addcomment) | **POST** /api/2/issue/{issueIdOrKey}/comment |  |
| [**addField**](ApiApi.md#addfield) | **POST** /api/2/screens/{screenId}/tabs/{tabId}/fields |  |
| [**addFieldToDefaultScreen**](ApiApi.md#addfieldtodefaultscreen) | **POST** /api/2/screens/addToDefault/{fieldId} |  |
| [**addProjectAssociationsToScheme**](ApiApi.md#addprojectassociationstoscheme) | **POST** /api/2/issuetypescheme/{schemeId}/associations |  |
| [**addProjectRoleActorsToRole**](ApiApi.md#addprojectroleactorstorole) | **POST** /api/2/role/{id}/actors |  |
| [**addRecord**](ApiApi.md#addrecord) | **POST** /api/2/auditing/record |  |
| [**addSharePermission**](ApiApi.md#addsharepermission) | **POST** /api/2/filter/{id}/permission |  |
| [**addTab**](ApiApi.md#addtab) | **POST** /api/2/screens/{screenId}/tabs |  |
| [**addUserToApplication**](ApiApi.md#addusertoapplication) | **POST** /api/2/user/application |  |
| [**addUserToGroup**](ApiApi.md#addusertogroup) | **POST** /api/2/group/user |  |
| [**addVote**](ApiApi.md#addvote) | **POST** /api/2/issue/{issueIdOrKey}/votes |  |
| [**addWatcher**](ApiApi.md#addwatcher) | **POST** /api/2/issue/{issueIdOrKey}/watchers |  |
| [**addWorklog**](ApiApi.md#addworklog) | **POST** /api/2/issue/{issueIdOrKey}/worklog |  |
| [**applyEmailTemplates**](ApiApi.md#applyemailtemplates) | **POST** /api/2/email-templates/apply |  |
| [**approveUpgrade**](ApiApi.md#approveupgrade) | **POST** /api/2/cluster/zdu/approve |  |
| [**archiveIssue**](ApiApi.md#archiveissue) | **PUT** /api/2/issue/{issueIdOrKey}/archive |  |
| [**archiveIssues**](ApiApi.md#archiveissues) | **POST** /api/2/issue/archive |  |
| [**archiveProject**](ApiApi.md#archiveproject) | **PUT** /api/2/project/{projectIdOrKey}/archive |  |
| [**areMetricsExposed**](ApiApi.md#aremetricsexposed) | **GET** /api/2/monitoring/jmx/areMetricsExposed |  |
| [**assign**](ApiApi.md#assign) | **PUT** /api/2/issue/{issueIdOrKey}/assignee |  |
| [**assignPermissionScheme**](ApiApi.md#assignpermissionscheme) | **PUT** /api/2/project/{projectKeyOrId}/permissionscheme |  |
| [**assignPriorityScheme**](ApiApi.md#assignpriorityscheme) | **PUT** /api/2/project/{projectKeyOrId}/priorityscheme |  |
| [**bulkDeleteCustomFields**](ApiApi.md#bulkdeletecustomfields) | **DELETE** /api/2/customFields |  |
| [**canMoveSubTask**](ApiApi.md#canmovesubtask) | **GET** /api/2/issue/{issueIdOrKey}/subtask/move |  |
| [**cancelUpgrade**](ApiApi.md#cancelupgrade) | **POST** /api/2/cluster/zdu/cancel |  |
| [**changeMyPassword**](ApiApi.md#changemypassword) | **PUT** /api/2/myself/password |  |
| [**changeNodeStateToOffline**](ApiApi.md#changenodestatetooffline) | **PUT** /api/2/cluster/node/{nodeId}/offline |  |
| [**changeUserPassword**](ApiApi.md#changeuserpassword) | **PUT** /api/2/user/password |  |
| [**createAvatarFromTemporary**](ApiApi.md#createavatarfromtemporary) | **POST** /api/2/project/{projectIdOrKey}/avatar |  |
| [**createAvatarFromTemporary_0**](ApiApi.md#createavatarfromtemporary_0) | **POST** /api/2/issuetype/{id}/avatar |  |
| [**createAvatarFromTemporary_1**](ApiApi.md#createavatarfromtemporary_1) | **POST** /api/2/user/avatar |  |
| [**createAvatarFromTemporary_2**](ApiApi.md#createavatarfromtemporary_2) | **POST** /api/2/avatar/{type}/temporaryCrop |  |
| [**createAvatarFromTemporary_3**](ApiApi.md#createavatarfromtemporary_3) | **POST** /api/2/universal_avatar/type/{type}/owner/{owningObjectId}/avatar |  |
| [**createComponent**](ApiApi.md#createcomponent) | **POST** /api/2/component |  |
| [**createCustomField**](ApiApi.md#createcustomfield) | **POST** /api/2/field |  |
| [**createDraftForParent**](ApiApi.md#createdraftforparent) | **POST** /api/2/workflowscheme/{id}/createdraft |  |
| [**createFilter**](ApiApi.md#createfilter) | **POST** /api/2/filter |  |
| [**createGroup**](ApiApi.md#creategroup) | **POST** /api/2/group |  |
| [**createIndexSnapshot**](ApiApi.md#createindexsnapshot) | **POST** /api/2/index-snapshot |  |
| [**createIssue**](ApiApi.md#createissue) | **POST** /api/2/issue |  |
| [**createIssueLinkType**](ApiApi.md#createissuelinktype) | **POST** /api/2/issueLinkType |  |
| [**createIssueType**](ApiApi.md#createissuetype) | **POST** /api/2/issuetype |  |
| [**createIssueTypeScheme**](ApiApi.md#createissuetypescheme) | **POST** /api/2/issuetypescheme |  |
| [**createIssues**](ApiApi.md#createissues) | **POST** /api/2/issue/bulk |  |
| [**createOrUpdateRemoteIssueLink**](ApiApi.md#createorupdateremoteissuelink) | **POST** /api/2/issue/{issueIdOrKey}/remotelink |  |
| [**createOrUpdateRemoteVersionLink**](ApiApi.md#createorupdateremoteversionlink) | **POST** /api/2/version/{versionId}/remotelink |  |
| [**createOrUpdateRemoteVersionLink_0**](ApiApi.md#createorupdateremoteversionlink_0) | **POST** /api/2/version/{versionId}/remotelink/{globalId} |  |
| [**createPermissionGrant**](ApiApi.md#createpermissiongrant) | **POST** /api/2/permissionscheme/{schemeId}/permission |  |
| [**createPermissionScheme**](ApiApi.md#createpermissionscheme) | **POST** /api/2/permissionscheme |  |
| [**createPriorityScheme**](ApiApi.md#createpriorityscheme) | **POST** /api/2/priorityschemes |  |
| [**createProject**](ApiApi.md#createproject) | **POST** /api/2/project |  |
| [**createProjectCategory**](ApiApi.md#createprojectcategory) | **POST** /api/2/projectCategory |  |
| [**createProjectRole**](ApiApi.md#createprojectrole) | **POST** /api/2/role |  |
| [**createProperty**](ApiApi.md#createproperty) | **POST** /api/2/workflow/api/2/transitions/{id}/properties |  |
| [**createScheme**](ApiApi.md#createscheme) | **POST** /api/2/workflowscheme |  |
| [**createUser**](ApiApi.md#createuser) | **POST** /api/2/user |  |
| [**createVersion**](ApiApi.md#createversion) | **POST** /api/2/version |  |
| [**defaultColumns**](ApiApi.md#defaultcolumns) | **GET** /api/2/filter/{id}/columns |  |
| [**defaultColumns_0**](ApiApi.md#defaultcolumns_0) | **GET** /api/2/user/columns |  |
| [**deleteActor**](ApiApi.md#deleteactor) | **DELETE** /api/2/project/{projectIdOrKey}/role/{id} |  |
| [**deleteAvatar**](ApiApi.md#deleteavatar) | **DELETE** /api/2/project/{projectIdOrKey}/avatar/{id} |  |
| [**deleteAvatar_0**](ApiApi.md#deleteavatar_0) | **DELETE** /api/2/user/avatar/{id} |  |
| [**deleteAvatar_1**](ApiApi.md#deleteavatar_1) | **DELETE** /api/2/universal_avatar/type/{type}/owner/{owningObjectId}/avatar/{id} |  |
| [**deleteComment**](ApiApi.md#deletecomment) | **DELETE** /api/2/issue/{issueIdOrKey}/comment/{id} |  |
| [**deleteDefault**](ApiApi.md#deletedefault) | **DELETE** /api/2/workflowscheme/{id}/default |  |
| [**deleteDraftById**](ApiApi.md#deletedraftbyid) | **DELETE** /api/2/workflowscheme/{id}/draft |  |
| [**deleteDraftDefault**](ApiApi.md#deletedraftdefault) | **DELETE** /api/2/workflowscheme/{id}/draft/default |  |
| [**deleteDraftIssueType**](ApiApi.md#deletedraftissuetype) | **DELETE** /api/2/workflowscheme/{id}/draft/issuetype/{issueType} |  |
| [**deleteDraftWorkflowMapping**](ApiApi.md#deletedraftworkflowmapping) | **DELETE** /api/2/workflowscheme/{id}/draft/workflow |  |
| [**deleteFilter**](ApiApi.md#deletefilter) | **DELETE** /api/2/filter/{id} |  |
| [**deleteIssue**](ApiApi.md#deleteissue) | **DELETE** /api/2/issue/{issueIdOrKey} |  |
| [**deleteIssueLink**](ApiApi.md#deleteissuelink) | **DELETE** /api/2/issueLink/{linkId} |  |
| [**deleteIssueLinkType**](ApiApi.md#deleteissuelinktype) | **DELETE** /api/2/issueLinkType/{issueLinkTypeId} |  |
| [**deleteIssueType**](ApiApi.md#deleteissuetype) | **DELETE** /api/2/workflowscheme/{id}/issuetype/{issueType} |  |
| [**deleteIssueTypeScheme**](ApiApi.md#deleteissuetypescheme) | **DELETE** /api/2/issuetypescheme/{schemeId} |  |
| [**deleteIssueType_0**](ApiApi.md#deleteissuetype_0) | **DELETE** /api/2/issuetype/{id} |  |
| [**deleteNode**](ApiApi.md#deletenode) | **DELETE** /api/2/cluster/node/{nodeId} |  |
| [**deletePermissionScheme**](ApiApi.md#deletepermissionscheme) | **DELETE** /api/2/permissionscheme/{schemeId} |  |
| [**deletePermissionSchemeEntity**](ApiApi.md#deletepermissionschemeentity) | **DELETE** /api/2/permissionscheme/{schemeId}/permission/{permissionId} |  |
| [**deletePriorityScheme**](ApiApi.md#deletepriorityscheme) | **DELETE** /api/2/priorityschemes/{schemeId} |  |
| [**deleteProject**](ApiApi.md#deleteproject) | **DELETE** /api/2/project/{projectIdOrKey} |  |
| [**deleteProjectRole**](ApiApi.md#deleteprojectrole) | **DELETE** /api/2/role/{id} |  |
| [**deleteProjectRoleActorsFromRole**](ApiApi.md#deleteprojectroleactorsfromrole) | **DELETE** /api/2/role/{id}/actors |  |
| [**deleteProperty**](ApiApi.md#deleteproperty) | **DELETE** /api/2/issuetype/{issueTypeId}/properties/{propertyKey} |  |
| [**deleteProperty_0**](ApiApi.md#deleteproperty_0) | **DELETE** /api/2/dashboard/{dashboardId}/items/{itemId}/properties/{propertyKey} |  |
| [**deleteProperty_1**](ApiApi.md#deleteproperty_1) | **DELETE** /api/2/workflow/api/2/transitions/{id}/properties |  |
| [**deleteProperty_2**](ApiApi.md#deleteproperty_2) | **DELETE** /api/2/comment/{commentId}/properties/{propertyKey} |  |
| [**deleteProperty_3**](ApiApi.md#deleteproperty_3) | **DELETE** /api/2/project/{projectIdOrKey}/properties/{propertyKey} |  |
| [**deleteProperty_4**](ApiApi.md#deleteproperty_4) | **DELETE** /api/2/user/properties/{propertyKey} |  |
| [**deleteProperty_5**](ApiApi.md#deleteproperty_5) | **DELETE** /api/2/issue/{issueIdOrKey}/properties/{propertyKey} |  |
| [**deleteRemoteIssueLinkByGlobalId**](ApiApi.md#deleteremoteissuelinkbyglobalid) | **DELETE** /api/2/issue/{issueIdOrKey}/remotelink |  |
| [**deleteRemoteIssueLinkById**](ApiApi.md#deleteremoteissuelinkbyid) | **DELETE** /api/2/issue/{issueIdOrKey}/remotelink/{linkId} |  |
| [**deleteRemoteVersionLink**](ApiApi.md#deleteremoteversionlink) | **DELETE** /api/2/version/{versionId}/remotelink/{globalId} |  |
| [**deleteRemoteVersionLinksByVersionId**](ApiApi.md#deleteremoteversionlinksbyversionid) | **DELETE** /api/2/version/{versionId}/remotelink |  |
| [**deleteScheme**](ApiApi.md#deletescheme) | **DELETE** /api/2/workflowscheme/{id} |  |
| [**deleteSession**](ApiApi.md#deletesession) | **DELETE** /api/2/user/session/{username} |  |
| [**deleteSharePermission**](ApiApi.md#deletesharepermission) | **DELETE** /api/2/filter/{id}/permission/{permission-id} |  |
| [**deleteTab**](ApiApi.md#deletetab) | **DELETE** /api/2/screens/{screenId}/tabs/{tabId} |  |
| [**deleteWorkflowMapping**](ApiApi.md#deleteworkflowmapping) | **DELETE** /api/2/workflowscheme/{id}/workflow |  |
| [**deleteWorklog**](ApiApi.md#deleteworklog) | **DELETE** /api/2/issue/{issueIdOrKey}/worklog/{id} |  |
| [**doTransition**](ApiApi.md#dotransition) | **POST** /api/2/issue/{issueIdOrKey}/transitions |  |
| [**downloadEmailTemplates**](ApiApi.md#downloademailtemplates) | **GET** /api/2/email-templates |  |
| [**editFilter**](ApiApi.md#editfilter) | **PUT** /api/2/filter/{id} |  |
| [**editIssue**](ApiApi.md#editissue) | **PUT** /api/2/issue/{issueIdOrKey} |  |
| [**expandForHumans**](ApiApi.md#expandforhumans) | **GET** /api/2/attachment/{id}/expand/human |  |
| [**expandForMachines**](ApiApi.md#expandformachines) | **GET** /api/2/attachment/{id}/expand/raw |  |
| [**findAssignableUsers**](ApiApi.md#findassignableusers) | **GET** /api/2/user/assignable/search |  |
| [**findBulkAssignableUsers**](ApiApi.md#findbulkassignableusers) | **GET** /api/2/user/assignable/multiProjectSearch |  |
| [**findGroups**](ApiApi.md#findgroups) | **GET** /api/2/groups/picker |  |
| [**findUsers**](ApiApi.md#findusers) | **GET** /api/2/user/search |  |
| [**findUsersAndGroups**](ApiApi.md#findusersandgroups) | **GET** /api/2/groupuserpicker |  |
| [**findUsersForPicker**](ApiApi.md#findusersforpicker) | **GET** /api/2/user/picker |  |
| [**findUsersWithAllPermissions**](ApiApi.md#finduserswithallpermissions) | **GET** /api/2/user/permission/search |  |
| [**findUsersWithBrowsePermission**](ApiApi.md#finduserswithbrowsepermission) | **GET** /api/2/user/viewissue/search |  |
| [**fullyUpdateProjectRole**](ApiApi.md#fullyupdateprojectrole) | **PUT** /api/2/role/{id} |  |
| [**get**](ApiApi.md#get) | **GET** /api/2/applicationrole/{key} |  |
| [**getA11yPersonalSettings**](ApiApi.md#geta11ypersonalsettings) | **GET** /api/2/user/a11y/personal-settings |  |
| [**getAccessibleProjectTypeByKey**](ApiApi.md#getaccessibleprojecttypebykey) | **GET** /api/2/project/type/{projectTypeKey}/accessible |  |
| [**getAdvancedSettings**](ApiApi.md#getadvancedsettings) | **GET** /api/2/application-properties/advanced-settings |  |
| [**getAll**](ApiApi.md#getall) | **GET** /api/2/applicationrole |  |
| [**getAllAvatars**](ApiApi.md#getallavatars) | **GET** /api/2/project/{projectIdOrKey}/avatars |  |
| [**getAllAvatars_0**](ApiApi.md#getallavatars_0) | **GET** /api/2/user/avatars |  |
| [**getAllFields**](ApiApi.md#getallfields) | **GET** /api/2/screens/{screenId}/tabs/{tabId}/fields |  |
| [**getAllIssueTypeSchemes**](ApiApi.md#getallissuetypeschemes) | **GET** /api/2/issuetypescheme |  |
| [**getAllNodes**](ApiApi.md#getallnodes) | **GET** /api/2/cluster/nodes |  |
| [**getAllPermissions**](ApiApi.md#getallpermissions) | **GET** /api/2/permissions |  |
| [**getAllProjectCategories**](ApiApi.md#getallprojectcategories) | **GET** /api/2/projectCategory |  |
| [**getAllProjectTypes**](ApiApi.md#getallprojecttypes) | **GET** /api/2/project/type |  |
| [**getAllProjects**](ApiApi.md#getallprojects) | **GET** /api/2/project |  |
| [**getAllScreens**](ApiApi.md#getallscreens) | **GET** /api/2/screens |  |
| [**getAllStatuses**](ApiApi.md#getallstatuses) | **GET** /api/2/project/{projectIdOrKey}/statuses |  |
| [**getAllSystemAvatars**](ApiApi.md#getallsystemavatars) | **GET** /api/2/avatar/{type}/system |  |
| [**getAllTabs**](ApiApi.md#getalltabs) | **GET** /api/2/screens/{screenId}/tabs |  |
| [**getAllTerminologyEntries**](ApiApi.md#getallterminologyentries) | **GET** /api/2/terminology/entries |  |
| [**getAllWorkflows**](ApiApi.md#getallworkflows) | **GET** /api/2/workflow |  |
| [**getAlternativeIssueTypes**](ApiApi.md#getalternativeissuetypes) | **GET** /api/2/issuetype/{id}/alternatives |  |
| [**getAssignedPermissionScheme**](ApiApi.md#getassignedpermissionscheme) | **GET** /api/2/project/{projectKeyOrId}/permissionscheme |  |
| [**getAssignedPriorityScheme**](ApiApi.md#getassignedpriorityscheme) | **GET** /api/2/project/{projectKeyOrId}/priorityscheme |  |
| [**getAssociatedProjects**](ApiApi.md#getassociatedprojects) | **GET** /api/2/issuetypescheme/{schemeId}/associations |  |
| [**getAttachment**](ApiApi.md#getattachment) | **GET** /api/2/attachment/{id} |  |
| [**getAttachmentMeta**](ApiApi.md#getattachmentmeta) | **GET** /api/2/attachment/meta |  |
| [**getAutoComplete**](ApiApi.md#getautocomplete) | **GET** /api/2/jql/autocompletedata |  |
| [**getAvailableMetrics**](ApiApi.md#getavailablemetrics) | **GET** /api/2/monitoring/jmx/getAvailableMetrics |  |
| [**getAvatars**](ApiApi.md#getavatars) | **GET** /api/2/universal_avatar/type/{type}/owner/{owningObjectId} |  |
| [**getById**](ApiApi.md#getbyid) | **GET** /api/2/workflowscheme/{id} |  |
| [**getComment**](ApiApi.md#getcomment) | **GET** /api/2/issue/{issueIdOrKey}/comment/{id} |  |
| [**getComments**](ApiApi.md#getcomments) | **GET** /api/2/issue/{issueIdOrKey}/comment |  |
| [**getComponent**](ApiApi.md#getcomponent) | **GET** /api/2/component/{id} |  |
| [**getComponentRelatedIssues**](ApiApi.md#getcomponentrelatedissues) | **GET** /api/2/component/{id}/relatedIssueCounts |  |
| [**getConfiguration**](ApiApi.md#getconfiguration) | **GET** /api/2/configuration |  |
| [**getCreateIssueMetaFields**](ApiApi.md#getcreateissuemetafields) | **GET** /api/2/issue/createmeta/{projectIdOrKey}/issuetypes/{issueTypeId} |  |
| [**getCreateIssueMetaProjectIssueTypes**](ApiApi.md#getcreateissuemetaprojectissuetypes) | **GET** /api/2/issue/createmeta/{projectIdOrKey}/issuetypes |  |
| [**getCustomFieldOption**](ApiApi.md#getcustomfieldoption) | **GET** /api/2/customFieldOption/{id} |  |
| [**getCustomFieldOptions**](ApiApi.md#getcustomfieldoptions) | **GET** /api/2/customFields/{customFieldId}/options |  |
| [**getCustomFields**](ApiApi.md#getcustomfields) | **GET** /api/2/customFields |  |
| [**getDashboard**](ApiApi.md#getdashboard) | **GET** /api/2/dashboard/{id} |  |
| [**getDefault**](ApiApi.md#getdefault) | **GET** /api/2/workflowscheme/{id}/default |  |
| [**getDefaultShareScope**](ApiApi.md#getdefaultsharescope) | **GET** /api/2/filter/defaultShareScope |  |
| [**getDraftById**](ApiApi.md#getdraftbyid) | **GET** /api/2/workflowscheme/{id}/draft |  |
| [**getDraftDefault**](ApiApi.md#getdraftdefault) | **GET** /api/2/workflowscheme/{id}/draft/default |  |
| [**getDraftIssueType**](ApiApi.md#getdraftissuetype) | **GET** /api/2/workflowscheme/{id}/draft/issuetype/{issueType} |  |
| [**getDraftWorkflow**](ApiApi.md#getdraftworkflow) | **GET** /api/2/workflowscheme/{id}/draft/workflow |  |
| [**getDuplicatedUsersCount**](ApiApi.md#getduplicateduserscount) | **GET** /api/2/user/duplicated/count |  |
| [**getDuplicatedUsersMapping**](ApiApi.md#getduplicatedusersmapping) | **GET** /api/2/user/duplicated/list |  |
| [**getEditIssueMeta**](ApiApi.md#geteditissuemeta) | **GET** /api/2/issue/{issueIdOrKey}/editmeta |  |
| [**getEmailTypes**](ApiApi.md#getemailtypes) | **GET** /api/2/email-templates/types |  |
| [**getFavouriteFilters**](ApiApi.md#getfavouritefilters) | **GET** /api/2/filter/favourite |  |
| [**getFieldAutoCompleteForQueryString**](ApiApi.md#getfieldautocompleteforquerystring) | **GET** /api/2/jql/autocompletedata/suggestions |  |
| [**getFields**](ApiApi.md#getfields) | **GET** /api/2/field |  |
| [**getFieldsToAdd**](ApiApi.md#getfieldstoadd) | **GET** /api/2/screens/{screenId}/availableFields |  |
| [**getFilter**](ApiApi.md#getfilter) | **GET** /api/2/filter/{id} |  |
| [**getGroup**](ApiApi.md#getgroup) | **GET** /api/2/group |  |
| [**getIdsOfWorklogsDeletedSince**](ApiApi.md#getidsofworklogsdeletedsince) | **GET** /api/2/worklog/deleted |  |
| [**getIdsOfWorklogsModifiedSince**](ApiApi.md#getidsofworklogsmodifiedsince) | **GET** /api/2/worklog/updated |  |
| [**getIndexSummary**](ApiApi.md#getindexsummary) | **GET** /api/2/index/summary |  |
| [**getIssue**](ApiApi.md#getissue) | **GET** /api/2/issue/{issueIdOrKey} |  |
| [**getIssueAllTypes**](ApiApi.md#getissuealltypes) | **GET** /api/2/issuetype |  |
| [**getIssueLink**](ApiApi.md#getissuelink) | **GET** /api/2/issueLink/{linkId} |  |
| [**getIssueLinkType**](ApiApi.md#getissuelinktype) | **GET** /api/2/issueLinkType/{issueLinkTypeId} |  |
| [**getIssueLinkTypes**](ApiApi.md#getissuelinktypes) | **GET** /api/2/issueLinkType |  |
| [**getIssueNavigatorDefaultColumns**](ApiApi.md#getissuenavigatordefaultcolumns) | **GET** /api/2/settings/columns |  |
| [**getIssuePickerResource**](ApiApi.md#getissuepickerresource) | **GET** /api/2/issue/picker |  |
| [**getIssueSecurityScheme**](ApiApi.md#getissuesecurityscheme) | **GET** /api/2/project/{projectKeyOrId}/issuesecuritylevelscheme |  |
| [**getIssueSecurityScheme_0**](ApiApi.md#getissuesecurityscheme_0) | **GET** /api/2/issuesecurityschemes/{id} |  |
| [**getIssueSecuritySchemes**](ApiApi.md#getissuesecurityschemes) | **GET** /api/2/issuesecurityschemes |  |
| [**getIssueType**](ApiApi.md#getissuetype) | **GET** /api/2/workflowscheme/{id}/issuetype/{issueType} |  |
| [**getIssueTypeScheme**](ApiApi.md#getissuetypescheme) | **GET** /api/2/issuetypescheme/{schemeId} |  |
| [**getIssueType_0**](ApiApi.md#getissuetype_0) | **GET** /api/2/issuetype/{id} |  |
| [**getIssueWatchers**](ApiApi.md#getissuewatchers) | **GET** /api/2/issue/{issueIdOrKey}/watchers |  |
| [**getIssueWorklog**](ApiApi.md#getissueworklog) | **GET** /api/2/issue/{issueIdOrKey}/worklog |  |
| [**getIssuesecuritylevel**](ApiApi.md#getissuesecuritylevel) | **GET** /api/2/securitylevel/{id} |  |
| [**getNotificationScheme**](ApiApi.md#getnotificationscheme) | **GET** /api/2/notificationscheme/{id} |  |
| [**getNotificationScheme_0**](ApiApi.md#getnotificationscheme_0) | **GET** /api/2/project/{projectKeyOrId}/notificationscheme |  |
| [**getNotificationSchemes**](ApiApi.md#getnotificationschemes) | **GET** /api/2/notificationscheme |  |
| [**getPaginatedComponents**](ApiApi.md#getpaginatedcomponents) | **GET** /api/2/component/page |  |
| [**getPaginatedIssueTypes**](ApiApi.md#getpaginatedissuetypes) | **GET** /api/2/issuetype/page |  |
| [**getPaginatedResolutions**](ApiApi.md#getpaginatedresolutions) | **GET** /api/2/resolution/page |  |
| [**getPaginatedStatuses**](ApiApi.md#getpaginatedstatuses) | **GET** /api/2/status/page |  |
| [**getPaginatedVersions**](ApiApi.md#getpaginatedversions) | **GET** /api/2/version |  |
| [**getPasswordPolicy**](ApiApi.md#getpasswordpolicy) | **GET** /api/2/password/policy |  |
| [**getPermissionScheme**](ApiApi.md#getpermissionscheme) | **GET** /api/2/permissionscheme/{schemeId} |  |
| [**getPermissionSchemeGrant**](ApiApi.md#getpermissionschemegrant) | **GET** /api/2/permissionscheme/{schemeId}/permission/{permissionId} |  |
| [**getPermissionSchemeGrants**](ApiApi.md#getpermissionschemegrants) | **GET** /api/2/permissionscheme/{schemeId}/permission |  |
| [**getPermissionSchemes**](ApiApi.md#getpermissionschemes) | **GET** /api/2/permissionscheme |  |
| [**getPermissions**](ApiApi.md#getpermissions) | **GET** /api/2/mypermissions |  |
| [**getPinnedComments**](ApiApi.md#getpinnedcomments) | **GET** /api/2/issue/{issueIdOrKey}/pinned-comments |  |
| [**getPreference**](ApiApi.md#getpreference) | **GET** /api/2/mypreferences |  |
| [**getPriorities**](ApiApi.md#getpriorities) | **GET** /api/2/priority |  |
| [**getPriorities_0**](ApiApi.md#getpriorities_0) | **GET** /api/2/priority/page |  |
| [**getPriority**](ApiApi.md#getpriority) | **GET** /api/2/priority/{id} |  |
| [**getPriorityScheme**](ApiApi.md#getpriorityscheme) | **GET** /api/2/priorityschemes/{schemeId} |  |
| [**getPrioritySchemes**](ApiApi.md#getpriorityschemes) | **GET** /api/2/priorityschemes |  |
| [**getProgress**](ApiApi.md#getprogress) | **GET** /api/2/user/anonymization/progress |  |
| [**getProgressBulk**](ApiApi.md#getprogressbulk) | **GET** /api/2/reindex/request/bulk |  |
| [**getProgress_0**](ApiApi.md#getprogress_0) | **GET** /api/2/reindex/request/{requestId} |  |
| [**getProject**](ApiApi.md#getproject) | **GET** /api/2/projectvalidate/key |  |
| [**getProjectCategoryById**](ApiApi.md#getprojectcategorybyid) | **GET** /api/2/projectCategory/{id} |  |
| [**getProjectComponents**](ApiApi.md#getprojectcomponents) | **GET** /api/2/project/{projectIdOrKey}/components |  |
| [**getProjectRole**](ApiApi.md#getprojectrole) | **GET** /api/2/project/{projectIdOrKey}/role/{id} |  |
| [**getProjectRoleActorsForRole**](ApiApi.md#getprojectroleactorsforrole) | **GET** /api/2/role/{id}/actors |  |
| [**getProjectRoles**](ApiApi.md#getprojectroles) | **GET** /api/2/role |  |
| [**getProjectRolesById**](ApiApi.md#getprojectrolesbyid) | **GET** /api/2/role/{id} |  |
| [**getProjectRoles_0**](ApiApi.md#getprojectroles_0) | **GET** /api/2/project/{projectIdOrKey}/role |  |
| [**getProjectTypeByKey**](ApiApi.md#getprojecttypebykey) | **GET** /api/2/project/type/{projectTypeKey} |  |
| [**getProjectVersions**](ApiApi.md#getprojectversions) | **GET** /api/2/project/{projectIdOrKey}/versions |  |
| [**getProjectVersionsPaginated**](ApiApi.md#getprojectversionspaginated) | **GET** /api/2/project/{projectIdOrKey}/version |  |
| [**getProject_0**](ApiApi.md#getproject_0) | **GET** /api/2/project/{projectIdOrKey} |  |
| [**getProperties**](ApiApi.md#getproperties) | **GET** /api/2/workflow/api/2/transitions/{id}/properties |  |
| [**getPropertiesKeys**](ApiApi.md#getpropertieskeys) | **GET** /api/2/dashboard/{dashboardId}/items/{itemId}/properties |  |
| [**getPropertiesKeys_0**](ApiApi.md#getpropertieskeys_0) | **GET** /api/2/comment/{commentId}/properties |  |
| [**getPropertiesKeys_1**](ApiApi.md#getpropertieskeys_1) | **GET** /api/2/project/{projectIdOrKey}/properties |  |
| [**getPropertiesKeys_2**](ApiApi.md#getpropertieskeys_2) | **GET** /api/2/user/properties |  |
| [**getPropertiesKeys_3**](ApiApi.md#getpropertieskeys_3) | **GET** /api/2/issue/{issueIdOrKey}/properties |  |
| [**getProperty**](ApiApi.md#getproperty) | **GET** /api/2/issuetype/{issueTypeId}/properties/{propertyKey} |  |
| [**getPropertyKeys**](ApiApi.md#getpropertykeys) | **GET** /api/2/issuetype/{issueTypeId}/properties |  |
| [**getProperty_0**](ApiApi.md#getproperty_0) | **GET** /api/2/dashboard/{dashboardId}/items/{itemId}/properties/{propertyKey} |  |
| [**getProperty_1**](ApiApi.md#getproperty_1) | **GET** /api/2/application-properties |  |
| [**getProperty_2**](ApiApi.md#getproperty_2) | **GET** /api/2/comment/{commentId}/properties/{propertyKey} |  |
| [**getProperty_3**](ApiApi.md#getproperty_3) | **GET** /api/2/project/{projectIdOrKey}/properties/{propertyKey} |  |
| [**getProperty_4**](ApiApi.md#getproperty_4) | **GET** /api/2/user/properties/{propertyKey} |  |
| [**getProperty_5**](ApiApi.md#getproperty_5) | **GET** /api/2/issue/{issueIdOrKey}/properties/{propertyKey} |  |
| [**getRecords**](ApiApi.md#getrecords) | **GET** /api/2/auditing/record |  |
| [**getReindexInfo**](ApiApi.md#getreindexinfo) | **GET** /api/2/reindex |  |
| [**getReindexProgress**](ApiApi.md#getreindexprogress) | **GET** /api/2/reindex/progress |  |
| [**getRemoteIssueLinkById**](ApiApi.md#getremoteissuelinkbyid) | **GET** /api/2/issue/{issueIdOrKey}/remotelink/{linkId} |  |
| [**getRemoteIssueLinks**](ApiApi.md#getremoteissuelinks) | **GET** /api/2/issue/{issueIdOrKey}/remotelink |  |
| [**getRemoteVersionLink**](ApiApi.md#getremoteversionlink) | **GET** /api/2/version/{versionId}/remotelink/{globalId} |  |
| [**getRemoteVersionLinks**](ApiApi.md#getremoteversionlinks) | **GET** /api/2/version/remotelink |  |
| [**getRemoteVersionLinksByVersionId**](ApiApi.md#getremoteversionlinksbyversionid) | **GET** /api/2/version/{versionId}/remotelink |  |
| [**getResolution**](ApiApi.md#getresolution) | **GET** /api/2/resolution/{id} |  |
| [**getResolutions**](ApiApi.md#getresolutions) | **GET** /api/2/resolution |  |
| [**getSchemeAttribute**](ApiApi.md#getschemeattribute) | **GET** /api/2/permissionscheme/{permissionSchemeId}/attribute/{attributeKey} |  |
| [**getSecurityLevelsForProject**](ApiApi.md#getsecuritylevelsforproject) | **GET** /api/2/project/{projectKeyOrId}/securitylevel |  |
| [**getServerInfo**](ApiApi.md#getserverinfo) | **GET** /api/2/serverInfo |  |
| [**getSharePermission**](ApiApi.md#getsharepermission) | **GET** /api/2/filter/{id}/permission/{permissionId} |  |
| [**getSharePermissions**](ApiApi.md#getsharepermissions) | **GET** /api/2/filter/{id}/permission |  |
| [**getState**](ApiApi.md#getstate) | **GET** /api/2/cluster/zdu/state |  |
| [**getStatus**](ApiApi.md#getstatus) | **GET** /api/2/status/{idOrName} |  |
| [**getStatusCategories**](ApiApi.md#getstatuscategories) | **GET** /api/2/statuscategory |  |
| [**getStatusCategory**](ApiApi.md#getstatuscategory) | **GET** /api/2/statuscategory/{idOrKey} |  |
| [**getStatuses**](ApiApi.md#getstatuses) | **GET** /api/2/status |  |
| [**getSubTasks**](ApiApi.md#getsubtasks) | **GET** /api/2/issue/{issueIdOrKey}/subtask |  |
| [**getTerminologyEntry**](ApiApi.md#getterminologyentry) | **GET** /api/2/terminology/entries/{originalName} |  |
| [**getTransitions**](ApiApi.md#gettransitions) | **GET** /api/2/issue/{issueIdOrKey}/transitions |  |
| [**getUpgradeResult**](ApiApi.md#getupgraderesult) | **GET** /api/2/upgrade |  |
| [**getUser**](ApiApi.md#getuser) | **GET** /api/2/user |  |
| [**getUser_0**](ApiApi.md#getuser_0) | **GET** /api/2/myself |  |
| [**getUsersFromGroup**](ApiApi.md#getusersfromgroup) | **GET** /api/2/group/member |  |
| [**getVersion**](ApiApi.md#getversion) | **GET** /api/2/version/{id} |  |
| [**getVersionRelatedIssues**](ApiApi.md#getversionrelatedissues) | **GET** /api/2/version/{id}/relatedIssueCounts |  |
| [**getVersionUnresolvedIssues**](ApiApi.md#getversionunresolvedissues) | **GET** /api/2/version/{id}/unresolvedIssueCount |  |
| [**getVotes**](ApiApi.md#getvotes) | **GET** /api/2/issue/{issueIdOrKey}/votes |  |
| [**getWorkflow**](ApiApi.md#getworkflow) | **GET** /api/2/workflowscheme/{id}/workflow |  |
| [**getWorkflowSchemeForProject**](ApiApi.md#getworkflowschemeforproject) | **GET** /api/2/project/{projectKeyOrId}/workflowscheme |  |
| [**getWorklog**](ApiApi.md#getworklog) | **GET** /api/2/issue/{issueIdOrKey}/worklog/{id} |  |
| [**getWorklogsForIds**](ApiApi.md#getworklogsforids) | **POST** /api/2/worklog/list |  |
| [**isAppMonitoringEnabled**](ApiApi.md#isappmonitoringenabled) | **GET** /api/2/monitoring/app |  |
| [**isIndexSnapshotRunning**](ApiApi.md#isindexsnapshotrunning) | **GET** /api/2/index-snapshot/isRunning |  |
| [**isIpdMonitoringEnabled**](ApiApi.md#isipdmonitoringenabled) | **GET** /api/2/monitoring/ipd |  |
| [**linkIssues**](ApiApi.md#linkissues) | **POST** /api/2/issueLink |  |
| [**list**](ApiApi.md#list) | **GET** /api/2/dashboard |  |
| [**listIndexSnapshot**](ApiApi.md#listindexsnapshot) | **GET** /api/2/index-snapshot |  |
| [**merge**](ApiApi.md#merge) | **PUT** /api/2/version/{id}/mergeto/{moveIssuesTo} |  |
| [**moveField**](ApiApi.md#movefield) | **POST** /api/2/screens/{screenId}/tabs/{tabId}/fields/{id}/move |  |
| [**moveSubTasks**](ApiApi.md#movesubtasks) | **POST** /api/2/issue/{issueIdOrKey}/subtask/move |  |
| [**moveTab**](ApiApi.md#movetab) | **POST** /api/2/screens/{screenId}/tabs/{tabId}/move/{pos} |  |
| [**moveVersion**](ApiApi.md#moveversion) | **POST** /api/2/version/{id}/move |  |
| [**notify**](ApiApi.md#notify) | **POST** /api/2/issue/{issueIdOrKey}/notify |  |
| [**partialUpdateProjectRole**](ApiApi.md#partialupdateprojectrole) | **POST** /api/2/role/{id} |  |
| [**policyCheckCreateUser**](ApiApi.md#policycheckcreateuser) | **POST** /api/2/password/policy/createUser |  |
| [**policyCheckUpdateUser**](ApiApi.md#policycheckupdateuser) | **POST** /api/2/password/policy/updateUser |  |
| [**processRequests**](ApiApi.md#processrequests) | **POST** /api/2/reindex/request |  |
| [**put**](ApiApi.md#put) | **PUT** /api/2/applicationrole/{key} |  |
| [**putBulk**](ApiApi.md#putbulk) | **PUT** /api/2/applicationrole |  |
| [**reindex**](ApiApi.md#reindex) | **POST** /api/2/reindex |  |
| [**reindexIssues**](ApiApi.md#reindexissues) | **POST** /api/2/reindex/issue |  |
| [**removeAllProjectAssociations**](ApiApi.md#removeallprojectassociations) | **DELETE** /api/2/issuetypescheme/{schemeId}/associations |  |
| [**removeAttachment**](ApiApi.md#removeattachment) | **DELETE** /api/2/attachment/{id} |  |
| [**removeField**](ApiApi.md#removefield) | **DELETE** /api/2/screens/{screenId}/tabs/{tabId}/fields/{id} |  |
| [**removeGroup**](ApiApi.md#removegroup) | **DELETE** /api/2/group |  |
| [**removePreference**](ApiApi.md#removepreference) | **DELETE** /api/2/mypreferences |  |
| [**removeProjectAssociation**](ApiApi.md#removeprojectassociation) | **DELETE** /api/2/issuetypescheme/{schemeId}/associations/{projIdOrKey} |  |
| [**removeProjectCategory**](ApiApi.md#removeprojectcategory) | **DELETE** /api/2/projectCategory/{id} |  |
| [**removeUser**](ApiApi.md#removeuser) | **DELETE** /api/2/user |  |
| [**removeUserFromApplication**](ApiApi.md#removeuserfromapplication) | **DELETE** /api/2/user/application |  |
| [**removeUserFromGroup**](ApiApi.md#removeuserfromgroup) | **DELETE** /api/2/group/user |  |
| [**removeVote**](ApiApi.md#removevote) | **DELETE** /api/2/issue/{issueIdOrKey}/votes |  |
| [**removeWatcher**](ApiApi.md#removewatcher) | **DELETE** /api/2/issue/{issueIdOrKey}/watchers |  |
| [**renameTab**](ApiApi.md#renametab) | **PUT** /api/2/screens/{screenId}/tabs/{tabId} |  |
| [**requestCurrentIndexFromNode**](ApiApi.md#requestcurrentindexfromnode) | **PUT** /api/2/cluster/index-snapshot/{nodeId} |  |
| [**resetColumns**](ApiApi.md#resetcolumns) | **DELETE** /api/2/filter/{id}/columns |  |
| [**resetColumns_0**](ApiApi.md#resetcolumns_0) | **DELETE** /api/2/user/columns |  |
| [**restoreIssue**](ApiApi.md#restoreissue) | **PUT** /api/2/issue/{issueIdOrKey}/restore |  |
| [**restoreProject**](ApiApi.md#restoreproject) | **PUT** /api/2/project/{projectIdOrKey}/restore |  |
| [**revertEmailTemplatesToDefault**](ApiApi.md#revertemailtemplatestodefault) | **POST** /api/2/email-templates/revert |  |
| [**runUpgradesNow**](ApiApi.md#runupgradesnow) | **POST** /api/2/upgrade |  |
| [**scheduleUserAnonymization**](ApiApi.md#scheduleuseranonymization) | **POST** /api/2/user/anonymization |  |
| [**scheduleUserAnonymizationRerun**](ApiApi.md#scheduleuseranonymizationrerun) | **POST** /api/2/user/anonymization/rerun |  |
| [**search**](ApiApi.md#search) | **GET** /api/2/search |  |
| [**searchForProjects**](ApiApi.md#searchforprojects) | **GET** /api/2/projects/picker |  |
| [**searchUsingSearchRequest**](ApiApi.md#searchusingsearchrequest) | **POST** /api/2/search |  |
| [**setActors**](ApiApi.md#setactors) | **PUT** /api/2/project/{projectIdOrKey}/role/{id} |  |
| [**setAppMonitoringEnabled**](ApiApi.md#setappmonitoringenabled) | **POST** /api/2/monitoring/ipd |  |
| [**setAppMonitoringEnabled_0**](ApiApi.md#setappmonitoringenabled_0) | **POST** /api/2/monitoring/app |  |
| [**setBaseURL**](ApiApi.md#setbaseurl) | **PUT** /api/2/settings/baseUrl |  |
| [**setColumns**](ApiApi.md#setcolumns) | **PUT** /api/2/filter/{id}/columns |  |
| [**setColumns_0**](ApiApi.md#setcolumns_0) | **PUT** /api/2/user/columns |  |
| [**setDefaultShareScope**](ApiApi.md#setdefaultsharescope) | **PUT** /api/2/filter/defaultShareScope |  |
| [**setDraftIssueType**](ApiApi.md#setdraftissuetype) | **PUT** /api/2/workflowscheme/{id}/draft/issuetype/{issueType} |  |
| [**setIssueNavigatorDefaultColumns**](ApiApi.md#setissuenavigatordefaultcolumns) | **PUT** /api/2/settings/columns |  |
| [**setIssueType**](ApiApi.md#setissuetype) | **PUT** /api/2/workflowscheme/{id}/issuetype/{issueType} |  |
| [**setPinComment**](ApiApi.md#setpincomment) | **PUT** /api/2/issue/{issueIdOrKey}/comment/{id}/pin |  |
| [**setPreference**](ApiApi.md#setpreference) | **PUT** /api/2/mypreferences |  |
| [**setProjectAssociationsForScheme**](ApiApi.md#setprojectassociationsforscheme) | **PUT** /api/2/issuetypescheme/{schemeId}/associations |  |
| [**setProperty**](ApiApi.md#setproperty) | **PUT** /api/2/issuetype/{issueTypeId}/properties/{propertyKey} |  |
| [**setPropertyViaRestfulTable**](ApiApi.md#setpropertyviarestfultable) | **PUT** /api/2/application-properties/{id} |  |
| [**setProperty_0**](ApiApi.md#setproperty_0) | **PUT** /api/2/dashboard/{dashboardId}/items/{itemId}/properties/{propertyKey} |  |
| [**setProperty_1**](ApiApi.md#setproperty_1) | **PUT** /api/2/comment/{commentId}/properties/{propertyKey} |  |
| [**setProperty_2**](ApiApi.md#setproperty_2) | **PUT** /api/2/project/{projectIdOrKey}/properties/{propertyKey} |  |
| [**setProperty_3**](ApiApi.md#setproperty_3) | **PUT** /api/2/user/properties/{propertyKey} |  |
| [**setProperty_4**](ApiApi.md#setproperty_4) | **PUT** /api/2/issue/{issueIdOrKey}/properties/{propertyKey} |  |
| [**setReadyToUpgrade**](ApiApi.md#setreadytoupgrade) | **POST** /api/2/cluster/zdu/start |  |
| [**setSchemeAttribute**](ApiApi.md#setschemeattribute) | **PUT** /api/2/permissionscheme/{permissionSchemeId}/attribute/{key} |  |
| [**setTerminologyEntries**](ApiApi.md#setterminologyentries) | **POST** /api/2/terminology/entries |  |
| [**start**](ApiApi.md#start) | **POST** /api/2/monitoring/jmx/startExposing |  |
| [**stop**](ApiApi.md#stop) | **POST** /api/2/monitoring/jmx/stopExposing |  |
| [**storeTemporaryAvatar**](ApiApi.md#storetemporaryavatar) | **POST** /api/2/avatar/{type}/temporary |  |
| [**storeTemporaryAvatarUsingMultiPart**](ApiApi.md#storetemporaryavatarusingmultipart) | **POST** /api/2/project/{projectIdOrKey}/avatar/temporary |  |
| [**storeTemporaryAvatarUsingMultiPart_0**](ApiApi.md#storetemporaryavatarusingmultipart_0) | **POST** /api/2/issuetype/{id}/avatar/temporary |  |
| [**storeTemporaryAvatarUsingMultiPart_1**](ApiApi.md#storetemporaryavatarusingmultipart_1) | **POST** /api/2/user/avatar/temporary |  |
| [**storeTemporaryAvatarUsingMultiPart_2**](ApiApi.md#storetemporaryavatarusingmultipart_2) | **POST** /api/2/universal_avatar/type/{type}/owner/{owningObjectId}/temp |  |
| [**unassignPriorityScheme**](ApiApi.md#unassignpriorityscheme) | **DELETE** /api/2/project/{projectKeyOrId}/priorityscheme/{schemeId} |  |
| [**unlockAnonymization**](ApiApi.md#unlockanonymization) | **DELETE** /api/2/user/anonymization/unlock |  |
| [**update**](ApiApi.md#update) | **PUT** /api/2/workflowscheme/{id} |  |
| [**updateComment**](ApiApi.md#updatecomment) | **PUT** /api/2/issue/{issueIdOrKey}/comment/{id} |  |
| [**updateComponent**](ApiApi.md#updatecomponent) | **PUT** /api/2/component/{id} |  |
| [**updateDefault**](ApiApi.md#updatedefault) | **PUT** /api/2/workflowscheme/{id}/default |  |
| [**updateDraft**](ApiApi.md#updatedraft) | **PUT** /api/2/workflowscheme/{id}/draft |  |
| [**updateDraftDefault**](ApiApi.md#updatedraftdefault) | **PUT** /api/2/workflowscheme/{id}/draft/default |  |
| [**updateDraftWorkflowMapping**](ApiApi.md#updatedraftworkflowmapping) | **PUT** /api/2/workflowscheme/{id}/draft/workflow |  |
| [**updateIssueLinkType**](ApiApi.md#updateissuelinktype) | **PUT** /api/2/issueLinkType/{issueLinkTypeId} |  |
| [**updateIssueType**](ApiApi.md#updateissuetype) | **PUT** /api/2/issuetype/{id} |  |
| [**updateIssueTypeScheme**](ApiApi.md#updateissuetypescheme) | **PUT** /api/2/issuetypescheme/{schemeId} |  |
| [**updatePermissionScheme**](ApiApi.md#updatepermissionscheme) | **PUT** /api/2/permissionscheme/{schemeId} |  |
| [**updatePriorityScheme**](ApiApi.md#updatepriorityscheme) | **PUT** /api/2/priorityschemes/{schemeId} |  |
| [**updateProject**](ApiApi.md#updateproject) | **PUT** /api/2/project/{projectIdOrKey} |  |
| [**updateProjectAvatar**](ApiApi.md#updateprojectavatar) | **PUT** /api/2/project/{projectIdOrKey}/avatar |  |
| [**updateProjectCategory**](ApiApi.md#updateprojectcategory) | **PUT** /api/2/projectCategory/{id} |  |
| [**updateProjectType**](ApiApi.md#updateprojecttype) | **PUT** /api/2/project/{projectIdOrKey}/type/{newProjectTypeKey} |  |
| [**updateProperty**](ApiApi.md#updateproperty) | **PUT** /api/2/workflow/api/2/transitions/{id}/properties |  |
| [**updateRemoteIssueLink**](ApiApi.md#updateremoteissuelink) | **PUT** /api/2/issue/{issueIdOrKey}/remotelink/{linkId} |  |
| [**updateShowWhenEmptyIndicator**](ApiApi.md#updateshowwhenemptyindicator) | **PUT** /api/2/screens/{screenId}/tabs/{tabId}/fields/{id}/updateShowWhenEmptyIndicator/{newValue} |  |
| [**updateUser**](ApiApi.md#updateuser) | **PUT** /api/2/user |  |
| [**updateUserAvatar**](ApiApi.md#updateuseravatar) | **PUT** /api/2/user/avatar |  |
| [**updateUser_0**](ApiApi.md#updateuser_0) | **PUT** /api/2/myself |  |
| [**updateVersion**](ApiApi.md#updateversion) | **PUT** /api/2/version/{id} |  |
| [**updateWorkflowMapping**](ApiApi.md#updateworkflowmapping) | **PUT** /api/2/workflowscheme/{id}/workflow |  |
| [**updateWorklog**](ApiApi.md#updateworklog) | **PUT** /api/2/issue/{issueIdOrKey}/worklog/{id} |  |
| [**uploadEmailTemplates**](ApiApi.md#uploademailtemplates) | **POST** /api/2/email-templates |  |
| [**validate**](ApiApi.md#validate) | **POST** /api/2/licenseValidator |  |
| [**validateUserAnonymization**](ApiApi.md#validateuseranonymization) | **GET** /api/2/user/anonymization |  |
| [**validateUserAnonymizationRerun**](ApiApi.md#validateuseranonymizationrerun) | **GET** /api/2/user/anonymization/rerun |  |



## _delete

> { [key: string]: any; } _delete(id, moveFixIssuesTo, moveAffectedIssuesTo)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { DeleteRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    id: id_example,
    // string (optional)
    moveFixIssuesTo: moveFixIssuesTo_example,
    // string (optional)
    moveAffectedIssuesTo: moveAffectedIssuesTo_example,
  } satisfies DeleteRequest;

  try {
    const data = await api._delete(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |
| **moveFixIssuesTo** | `string` |  | [Optional] [Defaults to `undefined`] |
| **moveAffectedIssuesTo** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## _delete_0

> { [key: string]: any; } _delete_0(id, requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { Delete0Request } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    id: id_example,
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies Delete0Request;

  try {
    const data = await api._delete_0(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## _delete_1

> { [key: string]: any; } _delete_1(id, moveIssuesTo)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { Delete1Request } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    id: id_example,
    // string (optional)
    moveIssuesTo: moveIssuesTo_example,
  } satisfies Delete1Request;

  try {
    const data = await api._delete_1(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |
| **moveIssuesTo** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## acknowledgeErrors

> string acknowledgeErrors()



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { AcknowledgeErrorsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  try {
    const data = await api.acknowledgeErrors();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**string**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `*/*`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## addActorUsers

> { [key: string]: any; } addActorUsers(projectIdOrKey, projectIdOrKey2, id, requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { AddActorUsersRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    projectIdOrKey: projectIdOrKey_example,
    // string
    projectIdOrKey2: projectIdOrKey_example,
    // number
    id: 56,
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies AddActorUsersRequest;

  try {
    const data = await api.addActorUsers(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **projectIdOrKey** | `string` |  | [Defaults to `undefined`] |
| **projectIdOrKey2** | `string` |  | [Defaults to `undefined`] |
| **id** | `number` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **404** | Response 404 |  -  |
| **410** | Response 410 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## addAttachment

> { [key: string]: any; } addAttachment(issueIdOrKey)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { AddAttachmentRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueIdOrKey: issueIdOrKey_example,
  } satisfies AddAttachmentRequest;

  try {
    const data = await api.addAttachment(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueIdOrKey** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## addComment

> { [key: string]: any; } addComment(issueIdOrKey, requestBody, expand)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { AddCommentRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueIdOrKey: issueIdOrKey_example,
    // { [key: string]: any; }
    requestBody: Object,
    // string (optional)
    expand: expand_example,
  } satisfies AddCommentRequest;

  try {
    const data = await api.addComment(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueIdOrKey** | `string` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |
| **expand** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Response 201 |  -  |
| **400** | Response 400 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## addField

> { [key: string]: any; } addField(screenId, tabId, requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { AddFieldRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    screenId: 56,
    // number
    tabId: 56,
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies AddFieldRequest;

  try {
    const data = await api.addField(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **screenId** | `number` |  | [Defaults to `undefined`] |
| **tabId** | `number` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## addFieldToDefaultScreen

> { [key: string]: any; } addFieldToDefaultScreen(fieldId)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { AddFieldToDefaultScreenRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    fieldId: fieldId_example,
  } satisfies AddFieldToDefaultScreenRequest;

  try {
    const data = await api.addFieldToDefaultScreen(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **fieldId** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Response 201 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## addProjectAssociationsToScheme

> { [key: string]: any; } addProjectAssociationsToScheme(schemeId, requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { AddProjectAssociationsToSchemeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    schemeId: schemeId_example,
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies AddProjectAssociationsToSchemeRequest;

  try {
    const data = await api.addProjectAssociationsToScheme(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **schemeId** | `string` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **201** | Response 201 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## addProjectRoleActorsToRole

> { [key: string]: any; } addProjectRoleActorsToRole(id, requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { AddProjectRoleActorsToRoleRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    id: 56,
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies AddProjectRoleActorsToRoleRequest;

  try {
    const data = await api.addProjectRoleActorsToRole(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `number` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## addRecord

> { [key: string]: any; } addRecord(requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { AddRecordRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies AddRecordRequest;

  try {
    const data = await api.addRecord(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Response 201 |  -  |
| **400** | Response 400 |  -  |
| **403** | Response 403 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## addSharePermission

> { [key: string]: any; } addSharePermission(id, requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { AddSharePermissionRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    id: 56,
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies AddSharePermissionRequest;

  try {
    const data = await api.addSharePermission(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `number` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Response 201 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## addTab

> { [key: string]: any; } addTab(screenId, requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { AddTabRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    screenId: 56,
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies AddTabRequest;

  try {
    const data = await api.addTab(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **screenId** | `number` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## addUserToApplication

> { [key: string]: any; } addUserToApplication(username, applicationKey)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { AddUserToApplicationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string (optional)
    username: username_example,
    // string (optional)
    applicationKey: applicationKey_example,
  } satisfies AddUserToApplicationRequest;

  try {
    const data = await api.addUserToApplication(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **username** | `string` |  | [Optional] [Defaults to `undefined`] |
| **applicationKey** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## addUserToGroup

> { [key: string]: any; } addUserToGroup(requestBody, groupname)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { AddUserToGroupRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // { [key: string]: any; }
    requestBody: Object,
    // string (optional)
    groupname: groupname_example,
  } satisfies AddUserToGroupRequest;

  try {
    const data = await api.addUserToGroup(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **requestBody** | `{ [key: string]: any; }` |  | |
| **groupname** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Response 201 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## addVote

> { [key: string]: any; } addVote(issueIdOrKey)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { AddVoteRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueIdOrKey: issueIdOrKey_example,
  } satisfies AddVoteRequest;

  try {
    const data = await api.addVote(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueIdOrKey** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## addWatcher

> { [key: string]: any; } addWatcher(issueIdOrKey, requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { AddWatcherRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueIdOrKey: issueIdOrKey_example,
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies AddWatcherRequest;

  try {
    const data = await api.addWatcher(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueIdOrKey** | `string` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## addWorklog

> { [key: string]: any; } addWorklog(issueIdOrKey, requestBody, adjustEstimate, newEstimate, reduceBy)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { AddWorklogRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueIdOrKey: issueIdOrKey_example,
    // { [key: string]: any; }
    requestBody: Object,
    // string (optional)
    adjustEstimate: adjustEstimate_example,
    // string (optional)
    newEstimate: newEstimate_example,
    // string (optional)
    reduceBy: reduceBy_example,
  } satisfies AddWorklogRequest;

  try {
    const data = await api.addWorklog(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueIdOrKey** | `string` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |
| **adjustEstimate** | `string` |  | [Optional] [Defaults to `undefined`] |
| **newEstimate** | `string` |  | [Optional] [Defaults to `undefined`] |
| **reduceBy** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Response 201 |  -  |
| **400** | Response 400 |  -  |
| **403** | Response 403 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## applyEmailTemplates

> { [key: string]: any; } applyEmailTemplates()



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { ApplyEmailTemplatesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  try {
    const data = await api.applyEmailTemplates();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## approveUpgrade

> string approveUpgrade()



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { ApproveUpgradeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  try {
    const data = await api.approveUpgrade();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**string**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `*/*`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## archiveIssue

> { [key: string]: any; } archiveIssue(issueIdOrKey, notifyUsers)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { ArchiveIssueRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueIdOrKey: issueIdOrKey_example,
    // boolean (optional)
    notifyUsers: true,
  } satisfies ArchiveIssueRequest;

  try {
    const data = await api.archiveIssue(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueIdOrKey** | `string` |  | [Defaults to `undefined`] |
| **notifyUsers** | `boolean` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## archiveIssues

> string archiveIssues(requestBody, notifyUsers)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { ArchiveIssuesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // { [key: string]: any; }
    requestBody: Object,
    // boolean (optional)
    notifyUsers: false,
  } satisfies ArchiveIssuesRequest;

  try {
    const data = await api.archiveIssues(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **requestBody** | `{ [key: string]: any; }` |  | |
| **notifyUsers** | `boolean` |  | [Optional] [Defaults to `undefined`] |

### Return type

**string**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `text/plain`, `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## archiveProject

> { [key: string]: any; } archiveProject(projectIdOrKey)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { ArchiveProjectRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    projectIdOrKey: projectIdOrKey_example,
  } satisfies ArchiveProjectRequest;

  try {
    const data = await api.archiveProject(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **projectIdOrKey** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## areMetricsExposed

> { [key: string]: any; } areMetricsExposed()



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { AreMetricsExposedRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  try {
    const data = await api.areMetricsExposed();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## assign

> { [key: string]: any; } assign(issueIdOrKey, requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { AssignRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueIdOrKey: issueIdOrKey_example,
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies AssignRequest;

  try {
    const data = await api.assign(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueIdOrKey** | `string` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## assignPermissionScheme

> { [key: string]: any; } assignPermissionScheme(projectKeyOrId, requestBody, expand)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { AssignPermissionSchemeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    projectKeyOrId: projectKeyOrId_example,
    // { [key: string]: any; }
    requestBody: Object,
    // string (optional)
    expand: expand_example,
  } satisfies AssignPermissionSchemeRequest;

  try {
    const data = await api.assignPermissionScheme(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **projectKeyOrId** | `string` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |
| **expand** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## assignPriorityScheme

> { [key: string]: any; } assignPriorityScheme(projectKeyOrId, requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { AssignPrioritySchemeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    projectKeyOrId: projectKeyOrId_example,
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies AssignPrioritySchemeRequest;

  try {
    const data = await api.assignPriorityScheme(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **projectKeyOrId** | `string` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## bulkDeleteCustomFields

> { [key: string]: any; } bulkDeleteCustomFields(ids)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { BulkDeleteCustomFieldsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string (optional)
    ids: ids_example,
  } satisfies BulkDeleteCustomFieldsRequest;

  try {
    const data = await api.bulkDeleteCustomFields(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **ids** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **423** | Response 423 |  -  |
| **503** | Response 503 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## canMoveSubTask

> { [key: string]: any; } canMoveSubTask(issueIdOrKey, issueIdOrKey2)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { CanMoveSubTaskRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueIdOrKey: issueIdOrKey_example,
    // string
    issueIdOrKey2: issueIdOrKey_example,
  } satisfies CanMoveSubTaskRequest;

  try {
    const data = await api.canMoveSubTask(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueIdOrKey** | `string` |  | [Defaults to `undefined`] |
| **issueIdOrKey2** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## cancelUpgrade

> { [key: string]: any; } cancelUpgrade()



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { CancelUpgradeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  try {
    const data = await api.cancelUpgrade();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## changeMyPassword

> { [key: string]: any; } changeMyPassword(requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { ChangeMyPasswordRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies ChangeMyPasswordRequest;

  try {
    const data = await api.changeMyPassword(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## changeNodeStateToOffline

> changeNodeStateToOffline(nodeId)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { ChangeNodeStateToOfflineRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    nodeId: nodeId_example,
  } satisfies ChangeNodeStateToOfflineRequest;

  try {
    const data = await api.changeNodeStateToOffline(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **nodeId** | `string` |  | [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **404** | Response 404 |  -  |
| **405** | Response 405 |  -  |
| **500** | Response 500 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## changeUserPassword

> { [key: string]: any; } changeUserPassword(requestBody, username, key)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { ChangeUserPasswordRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // { [key: string]: any; }
    requestBody: Object,
    // string (optional)
    username: username_example,
    // string (optional)
    key: key_example,
  } satisfies ChangeUserPasswordRequest;

  try {
    const data = await api.changeUserPassword(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **requestBody** | `{ [key: string]: any; }` |  | |
| **username** | `string` |  | [Optional] [Defaults to `undefined`] |
| **key** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## createAvatarFromTemporary

> { [key: string]: any; } createAvatarFromTemporary(projectIdOrKey, requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { CreateAvatarFromTemporaryRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    projectIdOrKey: projectIdOrKey_example,
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies CreateAvatarFromTemporaryRequest;

  try {
    const data = await api.createAvatarFromTemporary(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **projectIdOrKey** | `string` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Response 201 |  -  |
| **400** | Response 400 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## createAvatarFromTemporary_0

> { [key: string]: any; } createAvatarFromTemporary_0(id, requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { CreateAvatarFromTemporary0Request } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    id: id_example,
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies CreateAvatarFromTemporary0Request;

  try {
    const data = await api.createAvatarFromTemporary_0(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Response 201 |  -  |
| **400** | Response 400 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |
| **500** | Response 500 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## createAvatarFromTemporary_1

> { [key: string]: any; } createAvatarFromTemporary_1(requestBody, username)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { CreateAvatarFromTemporary1Request } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // { [key: string]: any; }
    requestBody: Object,
    // string (optional)
    username: username_example,
  } satisfies CreateAvatarFromTemporary1Request;

  try {
    const data = await api.createAvatarFromTemporary_1(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **requestBody** | `{ [key: string]: any; }` |  | |
| **username** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Response 201 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |
| **500** | Response 500 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## createAvatarFromTemporary_2

> { [key: string]: any; } createAvatarFromTemporary_2(type, requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { CreateAvatarFromTemporary2Request } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    type: type_example,
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies CreateAvatarFromTemporary2Request;

  try {
    const data = await api.createAvatarFromTemporary_2(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **type** | `string` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Response 201 |  -  |
| **400** | Response 400 |  -  |
| **500** | Response 500 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## createAvatarFromTemporary_3

> { [key: string]: any; } createAvatarFromTemporary_3(type, owningObjectId, requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { CreateAvatarFromTemporary3Request } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    type: type_example,
    // string
    owningObjectId: owningObjectId_example,
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies CreateAvatarFromTemporary3Request;

  try {
    const data = await api.createAvatarFromTemporary_3(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **type** | `string` |  | [Defaults to `undefined`] |
| **owningObjectId** | `string` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## createComponent

> { [key: string]: any; } createComponent(requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { CreateComponentRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies CreateComponentRequest;

  try {
    const data = await api.createComponent(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Response 201 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## createCustomField

> { [key: string]: any; } createCustomField(requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { CreateCustomFieldRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies CreateCustomFieldRequest;

  try {
    const data = await api.createCustomField(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Response 201 |  -  |
| **400** | Response 400 |  -  |
| **500** | Response 500 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## createDraftForParent

> { [key: string]: any; } createDraftForParent(id)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { CreateDraftForParentRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    id: 56,
  } satisfies CreateDraftForParentRequest;

  try {
    const data = await api.createDraftForParent(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `number` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Response 201 |  -  |
| **401** | Response 401 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## createFilter

> { [key: string]: any; } createFilter(requestBody, expand)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { CreateFilterRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // { [key: string]: any; }
    requestBody: Object,
    // string (optional)
    expand: expand_example,
  } satisfies CreateFilterRequest;

  try {
    const data = await api.createFilter(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **requestBody** | `{ [key: string]: any; }` |  | |
| **expand** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## createGroup

> { [key: string]: any; } createGroup(requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { CreateGroupRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies CreateGroupRequest;

  try {
    const data = await api.createGroup(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Response 201 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## createIndexSnapshot

> { [key: string]: any; } createIndexSnapshot()



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { CreateIndexSnapshotRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  try {
    const data = await api.createIndexSnapshot();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **202** | Response 202 |  -  |
| **401** | Response 401 |  -  |
| **409** | Response 409 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## createIssue

> { [key: string]: any; } createIssue(requestBody, updateHistory)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { CreateIssueRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // { [key: string]: any; }
    requestBody: Object,
    // boolean (optional)
    updateHistory: false,
  } satisfies CreateIssueRequest;

  try {
    const data = await api.createIssue(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **requestBody** | `{ [key: string]: any; }` |  | |
| **updateHistory** | `boolean` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Response 201 |  -  |
| **400** | Response 400 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## createIssueLinkType

> { [key: string]: any; } createIssueLinkType(requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { CreateIssueLinkTypeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies CreateIssueLinkTypeRequest;

  try {
    const data = await api.createIssueLinkType(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Response 201 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## createIssueType

> { [key: string]: any; } createIssueType(requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { CreateIssueTypeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies CreateIssueTypeRequest;

  try {
    const data = await api.createIssueType(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Response 201 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **409** | Response 409 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## createIssueTypeScheme

> { [key: string]: any; } createIssueTypeScheme(requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { CreateIssueTypeSchemeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies CreateIssueTypeSchemeRequest;

  try {
    const data = await api.createIssueTypeScheme(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## createIssues

> { [key: string]: any; } createIssues(requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { CreateIssuesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies CreateIssuesRequest;

  try {
    const data = await api.createIssues(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Response 201 |  -  |
| **400** | Response 400 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## createOrUpdateRemoteIssueLink

> { [key: string]: any; } createOrUpdateRemoteIssueLink(issueIdOrKey, requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { CreateOrUpdateRemoteIssueLinkRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueIdOrKey: issueIdOrKey_example,
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies CreateOrUpdateRemoteIssueLinkRequest;

  try {
    const data = await api.createOrUpdateRemoteIssueLink(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueIdOrKey** | `string` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## createOrUpdateRemoteVersionLink

> { [key: string]: any; } createOrUpdateRemoteVersionLink(versionId, requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { CreateOrUpdateRemoteVersionLinkRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    versionId: versionId_example,
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies CreateOrUpdateRemoteVersionLinkRequest;

  try {
    const data = await api.createOrUpdateRemoteVersionLink(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **versionId** | `string` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Response 201 |  -  |
| **400** | Response 400 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## createOrUpdateRemoteVersionLink_0

> { [key: string]: any; } createOrUpdateRemoteVersionLink_0(versionId, globalId, requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { CreateOrUpdateRemoteVersionLink0Request } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    versionId: versionId_example,
    // string
    globalId: globalId_example,
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies CreateOrUpdateRemoteVersionLink0Request;

  try {
    const data = await api.createOrUpdateRemoteVersionLink_0(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **versionId** | `string` |  | [Defaults to `undefined`] |
| **globalId** | `string` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Response 201 |  -  |
| **400** | Response 400 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## createPermissionGrant

> { [key: string]: any; } createPermissionGrant(schemeId, requestBody, expand)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { CreatePermissionGrantRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    schemeId: 56,
    // { [key: string]: any; }
    requestBody: Object,
    // string (optional)
    expand: expand_example,
  } satisfies CreatePermissionGrantRequest;

  try {
    const data = await api.createPermissionGrant(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **schemeId** | `number` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |
| **expand** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Response 201 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## createPermissionScheme

> { [key: string]: any; } createPermissionScheme(requestBody, expand)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { CreatePermissionSchemeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // { [key: string]: any; }
    requestBody: Object,
    // string (optional)
    expand: expand_example,
  } satisfies CreatePermissionSchemeRequest;

  try {
    const data = await api.createPermissionScheme(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **requestBody** | `{ [key: string]: any; }` |  | |
| **expand** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Response 201 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## createPriorityScheme

> { [key: string]: any; } createPriorityScheme(requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { CreatePrioritySchemeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies CreatePrioritySchemeRequest;

  try {
    const data = await api.createPriorityScheme(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Response 201 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **500** | Response 500 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## createProject

> { [key: string]: any; } createProject(requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { CreateProjectRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies CreateProjectRequest;

  try {
    const data = await api.createProject(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Response 201 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **409** | Response 409 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## createProjectCategory

> { [key: string]: any; } createProjectCategory(requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { CreateProjectCategoryRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies CreateProjectCategoryRequest;

  try {
    const data = await api.createProjectCategory(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Response 201 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **409** | Response 409 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## createProjectRole

> { [key: string]: any; } createProjectRole(requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { CreateProjectRoleRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies CreateProjectRoleRequest;

  try {
    const data = await api.createProjectRole(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **409** | Response 409 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## createProperty

> { [key: string]: any; } createProperty(id, requestBody, key, workflowName, workflowMode)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { CreatePropertyRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    id: 56,
    // { [key: string]: any; }
    requestBody: Object,
    // string (optional)
    key: key_example,
    // string (optional)
    workflowName: workflowName_example,
    // string (optional)
    workflowMode: workflowMode_example,
  } satisfies CreatePropertyRequest;

  try {
    const data = await api.createProperty(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `number` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |
| **key** | `string` |  | [Optional] [Defaults to `undefined`] |
| **workflowName** | `string` |  | [Optional] [Defaults to `undefined`] |
| **workflowMode** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **403** | Response 403 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## createScheme

> { [key: string]: any; } createScheme(requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { CreateSchemeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies CreateSchemeRequest;

  try {
    const data = await api.createScheme(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Response 201 |  -  |
| **401** | Response 401 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## createUser

> { [key: string]: any; } createUser(requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { CreateUserRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies CreateUserRequest;

  try {
    const data = await api.createUser(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Response 201 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **500** | Response 500 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## createVersion

> { [key: string]: any; } createVersion(requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { CreateVersionRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies CreateVersionRequest;

  try {
    const data = await api.createVersion(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Response 201 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## defaultColumns

> { [key: string]: any; } defaultColumns(id)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { DefaultColumnsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    id: 56,
  } satisfies DefaultColumnsRequest;

  try {
    const data = await api.defaultColumns(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `number` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **404** | Response 404 |  -  |
| **500** | Response 500 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## defaultColumns_0

> { [key: string]: any; } defaultColumns_0(username)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { DefaultColumns0Request } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string (optional)
    username: username_example,
  } satisfies DefaultColumns0Request;

  try {
    const data = await api.defaultColumns_0(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **username** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **404** | Response 404 |  -  |
| **500** | Response 500 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteActor

> { [key: string]: any; } deleteActor(projectIdOrKey, projectIdOrKey2, id, user, group)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { DeleteActorRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    projectIdOrKey: projectIdOrKey_example,
    // string
    projectIdOrKey2: projectIdOrKey_example,
    // number
    id: 56,
    // string (optional)
    user: user_example,
    // string (optional)
    group: group_example,
  } satisfies DeleteActorRequest;

  try {
    const data = await api.deleteActor(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **projectIdOrKey** | `string` |  | [Defaults to `undefined`] |
| **projectIdOrKey2** | `string` |  | [Defaults to `undefined`] |
| **id** | `number` |  | [Defaults to `undefined`] |
| **user** | `string` |  | [Optional] [Defaults to `undefined`] |
| **group** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **404** | Response 404 |  -  |
| **410** | Response 410 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteAvatar

> { [key: string]: any; } deleteAvatar(projectIdOrKey, id)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { DeleteAvatarRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    projectIdOrKey: projectIdOrKey_example,
    // number
    id: 56,
  } satisfies DeleteAvatarRequest;

  try {
    const data = await api.deleteAvatar(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **projectIdOrKey** | `string` |  | [Defaults to `undefined`] |
| **id** | `number` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteAvatar_0

> { [key: string]: any; } deleteAvatar_0(id, username)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { DeleteAvatar0Request } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    id: 56,
    // string (optional)
    username: username_example,
  } satisfies DeleteAvatar0Request;

  try {
    const data = await api.deleteAvatar_0(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `number` |  | [Defaults to `undefined`] |
| **username** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteAvatar_1

> { [key: string]: any; } deleteAvatar_1(id, type, owningObjectId)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { DeleteAvatar1Request } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    id: 56,
    // string
    type: type_example,
    // string
    owningObjectId: owningObjectId_example,
  } satisfies DeleteAvatar1Request;

  try {
    const data = await api.deleteAvatar_1(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `number` |  | [Defaults to `undefined`] |
| **type** | `string` |  | [Defaults to `undefined`] |
| **owningObjectId** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteComment

> { [key: string]: any; } deleteComment(issueIdOrKey, id)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { DeleteCommentRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueIdOrKey: issueIdOrKey_example,
    // string
    id: id_example,
  } satisfies DeleteCommentRequest;

  try {
    const data = await api.deleteComment(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueIdOrKey** | `string` |  | [Defaults to `undefined`] |
| **id** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **400** | Response 400 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteDefault

> { [key: string]: any; } deleteDefault(id, updateDraftIfNeeded)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { DeleteDefaultRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    id: 56,
    // boolean (optional)
    updateDraftIfNeeded: true,
  } satisfies DeleteDefaultRequest;

  try {
    const data = await api.deleteDefault(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `number` |  | [Defaults to `undefined`] |
| **updateDraftIfNeeded** | `boolean` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteDraftById

> { [key: string]: any; } deleteDraftById(id)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { DeleteDraftByIdRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    id: 56,
  } satisfies DeleteDraftByIdRequest;

  try {
    const data = await api.deleteDraftById(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `number` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **401** | Response 401 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteDraftDefault

> { [key: string]: any; } deleteDraftDefault(id)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { DeleteDraftDefaultRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    id: 56,
  } satisfies DeleteDraftDefaultRequest;

  try {
    const data = await api.deleteDraftDefault(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `number` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteDraftIssueType

> { [key: string]: any; } deleteDraftIssueType(issueType, id)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { DeleteDraftIssueTypeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueType: issueType_example,
    // number
    id: 56,
  } satisfies DeleteDraftIssueTypeRequest;

  try {
    const data = await api.deleteDraftIssueType(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueType** | `string` |  | [Defaults to `undefined`] |
| **id** | `number` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteDraftWorkflowMapping

> { [key: string]: any; } deleteDraftWorkflowMapping(id, workflowName)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { DeleteDraftWorkflowMappingRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    id: 56,
    // string (optional)
    workflowName: workflowName_example,
  } satisfies DeleteDraftWorkflowMappingRequest;

  try {
    const data = await api.deleteDraftWorkflowMapping(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `number` |  | [Defaults to `undefined`] |
| **workflowName** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteFilter

> { [key: string]: any; } deleteFilter(id)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { DeleteFilterRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    id: 56,
  } satisfies DeleteFilterRequest;

  try {
    const data = await api.deleteFilter(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `number` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteIssue

> { [key: string]: any; } deleteIssue(issueIdOrKey, deleteSubtasks)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { DeleteIssueRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueIdOrKey: issueIdOrKey_example,
    // string (optional)
    deleteSubtasks: deleteSubtasks_example,
  } satisfies DeleteIssueRequest;

  try {
    const data = await api.deleteIssue(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueIdOrKey** | `string` |  | [Defaults to `undefined`] |
| **deleteSubtasks** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteIssueLink

> { [key: string]: any; } deleteIssueLink(linkId)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { DeleteIssueLinkRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    linkId: linkId_example,
  } satisfies DeleteIssueLinkRequest;

  try {
    const data = await api.deleteIssueLink(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **linkId** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **204** | Response 204 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **404** | Response 404 |  -  |
| **500** | Response 500 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteIssueLinkType

> { [key: string]: any; } deleteIssueLinkType(issueLinkTypeId)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { DeleteIssueLinkTypeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueLinkTypeId: issueLinkTypeId_example,
  } satisfies DeleteIssueLinkTypeRequest;

  try {
    const data = await api.deleteIssueLinkType(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueLinkTypeId** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteIssueType

> { [key: string]: any; } deleteIssueType(issueType, id, updateDraftIfNeeded)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { DeleteIssueTypeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueType: issueType_example,
    // number
    id: 56,
    // boolean (optional)
    updateDraftIfNeeded: true,
  } satisfies DeleteIssueTypeRequest;

  try {
    const data = await api.deleteIssueType(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueType** | `string` |  | [Defaults to `undefined`] |
| **id** | `number` |  | [Defaults to `undefined`] |
| **updateDraftIfNeeded** | `boolean` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteIssueTypeScheme

> { [key: string]: any; } deleteIssueTypeScheme(schemeId)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { DeleteIssueTypeSchemeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    schemeId: schemeId_example,
  } satisfies DeleteIssueTypeSchemeRequest;

  try {
    const data = await api.deleteIssueTypeScheme(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **schemeId** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteIssueType_0

> { [key: string]: any; } deleteIssueType_0(id, alternativeIssueTypeId)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { DeleteIssueType0Request } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    id: id_example,
    // string (optional)
    alternativeIssueTypeId: alternativeIssueTypeId_example,
  } satisfies DeleteIssueType0Request;

  try {
    const data = await api.deleteIssueType_0(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |
| **alternativeIssueTypeId** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteNode

> deleteNode(nodeId)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { DeleteNodeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    nodeId: nodeId_example,
  } satisfies DeleteNodeRequest;

  try {
    const data = await api.deleteNode(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **nodeId** | `string` |  | [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **404** | Response 404 |  -  |
| **405** | Response 405 |  -  |
| **500** | Response 500 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deletePermissionScheme

> { [key: string]: any; } deletePermissionScheme(schemeId)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { DeletePermissionSchemeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    schemeId: 56,
  } satisfies DeletePermissionSchemeRequest;

  try {
    const data = await api.deletePermissionScheme(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **schemeId** | `number` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deletePermissionSchemeEntity

> { [key: string]: any; } deletePermissionSchemeEntity(permissionId, schemeId)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { DeletePermissionSchemeEntityRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    permissionId: 56,
    // number
    schemeId: 56,
  } satisfies DeletePermissionSchemeEntityRequest;

  try {
    const data = await api.deletePermissionSchemeEntity(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **permissionId** | `number` |  | [Defaults to `undefined`] |
| **schemeId** | `number` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deletePriorityScheme

> { [key: string]: any; } deletePriorityScheme(schemeId)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { DeletePrioritySchemeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    schemeId: 56,
  } satisfies DeletePrioritySchemeRequest;

  try {
    const data = await api.deletePriorityScheme(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **schemeId** | `number` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteProject

> { [key: string]: any; } deleteProject(projectIdOrKey)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { DeleteProjectRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    projectIdOrKey: projectIdOrKey_example,
  } satisfies DeleteProjectRequest;

  try {
    const data = await api.deleteProject(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **projectIdOrKey** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteProjectRole

> { [key: string]: any; } deleteProjectRole(id, swap)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { DeleteProjectRoleRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    id: 56,
    // number (optional)
    swap: 56,
  } satisfies DeleteProjectRoleRequest;

  try {
    const data = await api.deleteProjectRole(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `number` |  | [Defaults to `undefined`] |
| **swap** | `number` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |
| **409** | Response 409 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteProjectRoleActorsFromRole

> { [key: string]: any; } deleteProjectRoleActorsFromRole(id, user, group)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { DeleteProjectRoleActorsFromRoleRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    id: 56,
    // string (optional)
    user: user_example,
    // string (optional)
    group: group_example,
  } satisfies DeleteProjectRoleActorsFromRoleRequest;

  try {
    const data = await api.deleteProjectRoleActorsFromRole(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `number` |  | [Defaults to `undefined`] |
| **user** | `string` |  | [Optional] [Defaults to `undefined`] |
| **group** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteProperty

> { [key: string]: any; } deleteProperty(issueTypeId, propertyKey, issueTypeId2)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { DeletePropertyRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueTypeId: issueTypeId_example,
    // string
    propertyKey: propertyKey_example,
    // string
    issueTypeId2: issueTypeId_example,
  } satisfies DeletePropertyRequest;

  try {
    const data = await api.deleteProperty(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueTypeId** | `string` |  | [Defaults to `undefined`] |
| **propertyKey** | `string` |  | [Defaults to `undefined`] |
| **issueTypeId2** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **400** | Response 400 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteProperty_0

> { [key: string]: any; } deleteProperty_0(itemId, dashboardId, propertyKey, itemId2, dashboardId2)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { DeleteProperty0Request } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    itemId: itemId_example,
    // string
    dashboardId: dashboardId_example,
    // string
    propertyKey: propertyKey_example,
    // string
    itemId2: itemId_example,
    // string
    dashboardId2: dashboardId_example,
  } satisfies DeleteProperty0Request;

  try {
    const data = await api.deleteProperty_0(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **itemId** | `string` |  | [Defaults to `undefined`] |
| **dashboardId** | `string` |  | [Defaults to `undefined`] |
| **propertyKey** | `string` |  | [Defaults to `undefined`] |
| **itemId2** | `string` |  | [Defaults to `undefined`] |
| **dashboardId2** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **400** | Response 400 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteProperty_1

> { [key: string]: any; } deleteProperty_1(id, key, workflowName, workflowMode)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { DeleteProperty1Request } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    id: 56,
    // string (optional)
    key: key_example,
    // string (optional)
    workflowName: workflowName_example,
    // string (optional)
    workflowMode: workflowMode_example,
  } satisfies DeleteProperty1Request;

  try {
    const data = await api.deleteProperty_1(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `number` |  | [Defaults to `undefined`] |
| **key** | `string` |  | [Optional] [Defaults to `undefined`] |
| **workflowName** | `string` |  | [Optional] [Defaults to `undefined`] |
| **workflowMode** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **304** | Response 304 |  -  |
| **400** | Response 400 |  -  |
| **403** | Response 403 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteProperty_2

> { [key: string]: any; } deleteProperty_2(commentId, propertyKey, commentId2)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { DeleteProperty2Request } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    commentId: commentId_example,
    // string
    propertyKey: propertyKey_example,
    // string
    commentId2: commentId_example,
  } satisfies DeleteProperty2Request;

  try {
    const data = await api.deleteProperty_2(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **commentId** | `string` |  | [Defaults to `undefined`] |
| **propertyKey** | `string` |  | [Defaults to `undefined`] |
| **commentId2** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteProperty_3

> { [key: string]: any; } deleteProperty_3(projectIdOrKey, propertyKey, projectIdOrKey2)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { DeleteProperty3Request } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    projectIdOrKey: projectIdOrKey_example,
    // string
    propertyKey: propertyKey_example,
    // string
    projectIdOrKey2: projectIdOrKey_example,
  } satisfies DeleteProperty3Request;

  try {
    const data = await api.deleteProperty_3(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **projectIdOrKey** | `string` |  | [Defaults to `undefined`] |
| **propertyKey** | `string` |  | [Defaults to `undefined`] |
| **projectIdOrKey2** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteProperty_4

> { [key: string]: any; } deleteProperty_4(propertyKey, userKey, username)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { DeleteProperty4Request } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    propertyKey: propertyKey_example,
    // string (optional)
    userKey: userKey_example,
    // string (optional)
    username: username_example,
  } satisfies DeleteProperty4Request;

  try {
    const data = await api.deleteProperty_4(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **propertyKey** | `string` |  | [Defaults to `undefined`] |
| **userKey** | `string` |  | [Optional] [Defaults to `undefined`] |
| **username** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteProperty_5

> { [key: string]: any; } deleteProperty_5(issueIdOrKey, propertyKey, issueIdOrKey2)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { DeleteProperty5Request } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueIdOrKey: issueIdOrKey_example,
    // string
    propertyKey: propertyKey_example,
    // string
    issueIdOrKey2: issueIdOrKey_example,
  } satisfies DeleteProperty5Request;

  try {
    const data = await api.deleteProperty_5(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueIdOrKey** | `string` |  | [Defaults to `undefined`] |
| **propertyKey** | `string` |  | [Defaults to `undefined`] |
| **issueIdOrKey2** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteRemoteIssueLinkByGlobalId

> { [key: string]: any; } deleteRemoteIssueLinkByGlobalId(issueIdOrKey, globalId)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { DeleteRemoteIssueLinkByGlobalIdRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueIdOrKey: issueIdOrKey_example,
    // string (optional)
    globalId: globalId_example,
  } satisfies DeleteRemoteIssueLinkByGlobalIdRequest;

  try {
    const data = await api.deleteRemoteIssueLinkByGlobalId(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueIdOrKey** | `string` |  | [Defaults to `undefined`] |
| **globalId** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteRemoteIssueLinkById

> { [key: string]: any; } deleteRemoteIssueLinkById(linkId, issueIdOrKey)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { DeleteRemoteIssueLinkByIdRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    linkId: linkId_example,
    // string
    issueIdOrKey: issueIdOrKey_example,
  } satisfies DeleteRemoteIssueLinkByIdRequest;

  try {
    const data = await api.deleteRemoteIssueLinkById(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **linkId** | `string` |  | [Defaults to `undefined`] |
| **issueIdOrKey** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteRemoteVersionLink

> { [key: string]: any; } deleteRemoteVersionLink(versionId, globalId)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { DeleteRemoteVersionLinkRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    versionId: versionId_example,
    // string
    globalId: globalId_example,
  } satisfies DeleteRemoteVersionLinkRequest;

  try {
    const data = await api.deleteRemoteVersionLink(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **versionId** | `string` |  | [Defaults to `undefined`] |
| **globalId** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteRemoteVersionLinksByVersionId

> { [key: string]: any; } deleteRemoteVersionLinksByVersionId(versionId)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { DeleteRemoteVersionLinksByVersionIdRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    versionId: versionId_example,
  } satisfies DeleteRemoteVersionLinksByVersionIdRequest;

  try {
    const data = await api.deleteRemoteVersionLinksByVersionId(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **versionId** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteScheme

> { [key: string]: any; } deleteScheme(id)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { DeleteSchemeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    id: 56,
  } satisfies DeleteSchemeRequest;

  try {
    const data = await api.deleteScheme(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `number` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteSession

> { [key: string]: any; } deleteSession(username)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { DeleteSessionRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    username: username_example,
  } satisfies DeleteSessionRequest;

  try {
    const data = await api.deleteSession(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **username** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteSharePermission

> { [key: string]: any; } deleteSharePermission(id, permissionId)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { DeleteSharePermissionRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    id: 56,
    // number
    permissionId: 56,
  } satisfies DeleteSharePermissionRequest;

  try {
    const data = await api.deleteSharePermission(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `number` |  | [Defaults to `undefined`] |
| **permissionId** | `number` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **204** | Response 204 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteTab

> { [key: string]: any; } deleteTab(screenId, tabId)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { DeleteTabRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    screenId: 56,
    // number
    tabId: 56,
  } satisfies DeleteTabRequest;

  try {
    const data = await api.deleteTab(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **screenId** | `number` |  | [Defaults to `undefined`] |
| **tabId** | `number` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Response 201 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **412** | Response 412 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteWorkflowMapping

> { [key: string]: any; } deleteWorkflowMapping(id, workflowName, updateDraftIfNeeded)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { DeleteWorkflowMappingRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    id: 56,
    // string (optional)
    workflowName: workflowName_example,
    // boolean (optional)
    updateDraftIfNeeded: true,
  } satisfies DeleteWorkflowMappingRequest;

  try {
    const data = await api.deleteWorkflowMapping(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `number` |  | [Defaults to `undefined`] |
| **workflowName** | `string` |  | [Optional] [Defaults to `undefined`] |
| **updateDraftIfNeeded** | `boolean` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteWorklog

> { [key: string]: any; } deleteWorklog(issueIdOrKey, id, adjustEstimate, newEstimate, increaseBy)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { DeleteWorklogRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueIdOrKey: issueIdOrKey_example,
    // string
    id: id_example,
    // string (optional)
    adjustEstimate: adjustEstimate_example,
    // string (optional)
    newEstimate: newEstimate_example,
    // string (optional)
    increaseBy: increaseBy_example,
  } satisfies DeleteWorklogRequest;

  try {
    const data = await api.deleteWorklog(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueIdOrKey** | `string` |  | [Defaults to `undefined`] |
| **id** | `string` |  | [Defaults to `undefined`] |
| **adjustEstimate** | `string` |  | [Optional] [Defaults to `undefined`] |
| **newEstimate** | `string` |  | [Optional] [Defaults to `undefined`] |
| **increaseBy** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **400** | Response 400 |  -  |
| **403** | Response 403 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## doTransition

> { [key: string]: any; } doTransition(issueIdOrKey, requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { DoTransitionRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueIdOrKey: issueIdOrKey_example,
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies DoTransitionRequest;

  try {
    const data = await api.doTransition(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueIdOrKey** | `string` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **400** | Response 400 |  -  |
| **404** | Response 404 |  -  |
| **500** | Response 500 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## downloadEmailTemplates

> string downloadEmailTemplates()



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { DownloadEmailTemplatesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  try {
    const data = await api.downloadEmailTemplates();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**string**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/zip`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## editFilter

> { [key: string]: any; } editFilter(id, requestBody, expand)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { EditFilterRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    id: 56,
    // { [key: string]: any; }
    requestBody: Object,
    // string (optional)
    expand: expand_example,
  } satisfies EditFilterRequest;

  try {
    const data = await api.editFilter(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `number` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |
| **expand** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## editIssue

> { [key: string]: any; } editIssue(issueIdOrKey, requestBody, notifyUsers)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { EditIssueRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueIdOrKey: issueIdOrKey_example,
    // { [key: string]: any; }
    requestBody: Object,
    // boolean (optional)
    notifyUsers: true,
  } satisfies EditIssueRequest;

  try {
    const data = await api.editIssue(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueIdOrKey** | `string` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |
| **notifyUsers** | `boolean` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **400** | Response 400 |  -  |
| **403** | Response 403 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## expandForHumans

> { [key: string]: any; } expandForHumans(id)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { ExpandForHumansRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    id: id_example,
  } satisfies ExpandForHumansRequest;

  try {
    const data = await api.expandForHumans(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |
| **409** | Response 409 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## expandForMachines

> { [key: string]: any; } expandForMachines(id)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { ExpandForMachinesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    id: id_example,
  } satisfies ExpandForMachinesRequest;

  try {
    const data = await api.expandForMachines(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |
| **409** | Response 409 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## findAssignableUsers

> { [key: string]: any; } findAssignableUsers(username, project, issueKey, maxResults, actionDescriptorId)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { FindAssignableUsersRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string (optional)
    username: username_example,
    // string (optional)
    project: project_example,
    // string (optional)
    issueKey: issueKey_example,
    // number (optional)
    maxResults: 50,
    // number (optional)
    actionDescriptorId: 56,
  } satisfies FindAssignableUsersRequest;

  try {
    const data = await api.findAssignableUsers(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **username** | `string` |  | [Optional] [Defaults to `undefined`] |
| **project** | `string` |  | [Optional] [Defaults to `undefined`] |
| **issueKey** | `string` |  | [Optional] [Defaults to `undefined`] |
| **maxResults** | `number` |  | [Optional] [Defaults to `undefined`] |
| **actionDescriptorId** | `number` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## findBulkAssignableUsers

> { [key: string]: any; } findBulkAssignableUsers(username, projectKeys, maxResults)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { FindBulkAssignableUsersRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string (optional)
    username: username_example,
    // string (optional)
    projectKeys: projectKeys_example,
    // number (optional)
    maxResults: 50,
  } satisfies FindBulkAssignableUsersRequest;

  try {
    const data = await api.findBulkAssignableUsers(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **username** | `string` |  | [Optional] [Defaults to `undefined`] |
| **projectKeys** | `string` |  | [Optional] [Defaults to `undefined`] |
| **maxResults** | `number` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## findGroups

> { [key: string]: any; } findGroups(query, exclude, maxResults, userName)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { FindGroupsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string (optional)
    query: query_example,
    // string (optional)
    exclude: exclude_example,
    // number (optional)
    maxResults: 56,
    // string (optional)
    userName: userName_example,
  } satisfies FindGroupsRequest;

  try {
    const data = await api.findGroups(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **query** | `string` |  | [Optional] [Defaults to `undefined`] |
| **exclude** | `string` |  | [Optional] [Defaults to `undefined`] |
| **maxResults** | `number` |  | [Optional] [Defaults to `undefined`] |
| **userName** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## findUsers

> { [key: string]: any; } findUsers(username, startAt, maxResults, includeActive, includeInactive)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { FindUsersRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string (optional)
    username: username_example,
    // number (optional)
    startAt: 56,
    // number (optional)
    maxResults: 56,
    // boolean (optional)
    includeActive: true,
    // boolean (optional)
    includeInactive: true,
  } satisfies FindUsersRequest;

  try {
    const data = await api.findUsers(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **username** | `string` |  | [Optional] [Defaults to `undefined`] |
| **startAt** | `number` |  | [Optional] [Defaults to `undefined`] |
| **maxResults** | `number` |  | [Optional] [Defaults to `undefined`] |
| **includeActive** | `boolean` |  | [Optional] [Defaults to `undefined`] |
| **includeInactive** | `boolean` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## findUsersAndGroups

> { [key: string]: any; } findUsersAndGroups(query, maxResults, showAvatar, fieldId, projectId, issueTypeId)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { FindUsersAndGroupsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string (optional)
    query: query_example,
    // number (optional)
    maxResults: 56,
    // boolean (optional)
    showAvatar: true,
    // string (optional)
    fieldId: fieldId_example,
    // string (optional)
    projectId: projectId_example,
    // string (optional)
    issueTypeId: issueTypeId_example,
  } satisfies FindUsersAndGroupsRequest;

  try {
    const data = await api.findUsersAndGroups(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **query** | `string` |  | [Optional] [Defaults to `undefined`] |
| **maxResults** | `number` |  | [Optional] [Defaults to `undefined`] |
| **showAvatar** | `boolean` |  | [Optional] [Defaults to `undefined`] |
| **fieldId** | `string` |  | [Optional] [Defaults to `undefined`] |
| **projectId** | `string` |  | [Optional] [Defaults to `undefined`] |
| **issueTypeId** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **403** | Response 403 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## findUsersForPicker

> { [key: string]: any; } findUsersForPicker(query, maxResults, showAvatar, exclude)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { FindUsersForPickerRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string (optional)
    query: query_example,
    // number (optional)
    maxResults: 56,
    // boolean (optional)
    showAvatar: true,
    // string (optional)
    exclude: exclude_example,
  } satisfies FindUsersForPickerRequest;

  try {
    const data = await api.findUsersForPicker(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **query** | `string` |  | [Optional] [Defaults to `undefined`] |
| **maxResults** | `number` |  | [Optional] [Defaults to `undefined`] |
| **showAvatar** | `boolean` |  | [Optional] [Defaults to `undefined`] |
| **exclude** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## findUsersWithAllPermissions

> { [key: string]: any; } findUsersWithAllPermissions(username, permissions, issueKey, projectKey, startAt, maxResults)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { FindUsersWithAllPermissionsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string (optional)
    username: username_example,
    // string (optional)
    permissions: permissions_example,
    // string (optional)
    issueKey: issueKey_example,
    // string (optional)
    projectKey: projectKey_example,
    // number (optional)
    startAt: 56,
    // number (optional)
    maxResults: 56,
  } satisfies FindUsersWithAllPermissionsRequest;

  try {
    const data = await api.findUsersWithAllPermissions(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **username** | `string` |  | [Optional] [Defaults to `undefined`] |
| **permissions** | `string` |  | [Optional] [Defaults to `undefined`] |
| **issueKey** | `string` |  | [Optional] [Defaults to `undefined`] |
| **projectKey** | `string` |  | [Optional] [Defaults to `undefined`] |
| **startAt** | `number` |  | [Optional] [Defaults to `undefined`] |
| **maxResults** | `number` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## findUsersWithBrowsePermission

> { [key: string]: any; } findUsersWithBrowsePermission(username, issueKey, projectKey, maxResults)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { FindUsersWithBrowsePermissionRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string (optional)
    username: username_example,
    // string (optional)
    issueKey: issueKey_example,
    // string (optional)
    projectKey: projectKey_example,
    // number (optional)
    maxResults: 56,
  } satisfies FindUsersWithBrowsePermissionRequest;

  try {
    const data = await api.findUsersWithBrowsePermission(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **username** | `string` |  | [Optional] [Defaults to `undefined`] |
| **issueKey** | `string` |  | [Optional] [Defaults to `undefined`] |
| **projectKey** | `string` |  | [Optional] [Defaults to `undefined`] |
| **maxResults** | `number` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## fullyUpdateProjectRole

> { [key: string]: any; } fullyUpdateProjectRole(id, requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { FullyUpdateProjectRoleRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    id: 56,
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies FullyUpdateProjectRoleRequest;

  try {
    const data = await api.fullyUpdateProjectRole(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `number` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## get

> { [key: string]: any; } get(key)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    key: key_example,
  } satisfies GetRequest;

  try {
    const data = await api.get(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **key** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getA11yPersonalSettings

> { [key: string]: any; } getA11yPersonalSettings()



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetA11yPersonalSettingsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  try {
    const data = await api.getA11yPersonalSettings();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getAccessibleProjectTypeByKey

> { [key: string]: any; } getAccessibleProjectTypeByKey(projectTypeKey)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetAccessibleProjectTypeByKeyRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    projectTypeKey: projectTypeKey_example,
  } satisfies GetAccessibleProjectTypeByKeyRequest;

  try {
    const data = await api.getAccessibleProjectTypeByKey(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **projectTypeKey** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getAdvancedSettings

> { [key: string]: any; } getAdvancedSettings()



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetAdvancedSettingsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  try {
    const data = await api.getAdvancedSettings();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getAll

> { [key: string]: any; } getAll()



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetAllRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  try {
    const data = await api.getAll();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getAllAvatars

> { [key: string]: any; } getAllAvatars(projectIdOrKey)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetAllAvatarsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    projectIdOrKey: projectIdOrKey_example,
  } satisfies GetAllAvatarsRequest;

  try {
    const data = await api.getAllAvatars(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **projectIdOrKey** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getAllAvatars_0

> { [key: string]: any; } getAllAvatars_0(username)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetAllAvatars0Request } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string (optional)
    username: username_example,
  } satisfies GetAllAvatars0Request;

  try {
    const data = await api.getAllAvatars_0(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **username** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **404** | Response 404 |  -  |
| **500** | Response 500 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getAllFields

> { [key: string]: any; } getAllFields(screenId, tabId, projectKey)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetAllFieldsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    screenId: 56,
    // number
    tabId: 56,
    // string (optional)
    projectKey: projectKey_example,
  } satisfies GetAllFieldsRequest;

  try {
    const data = await api.getAllFields(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **screenId** | `number` |  | [Defaults to `undefined`] |
| **tabId** | `number` |  | [Defaults to `undefined`] |
| **projectKey** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getAllIssueTypeSchemes

> { [key: string]: any; } getAllIssueTypeSchemes()



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetAllIssueTypeSchemesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  try {
    const data = await api.getAllIssueTypeSchemes();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getAllNodes

> getAllNodes()



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetAllNodesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  try {
    const data = await api.getAllNodes();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

`void` (Empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **401** | Response 401 |  -  |
| **405** | Response 405 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getAllPermissions

> { [key: string]: any; } getAllPermissions()



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetAllPermissionsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  try {
    const data = await api.getAllPermissions();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getAllProjectCategories

> { [key: string]: any; } getAllProjectCategories()



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetAllProjectCategoriesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  try {
    const data = await api.getAllProjectCategories();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **500** | Response 500 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getAllProjectTypes

> { [key: string]: any; } getAllProjectTypes()



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetAllProjectTypesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  try {
    const data = await api.getAllProjectTypes();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getAllProjects

> { [key: string]: any; } getAllProjects(expand, recent, includeArchived, browseArchive)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetAllProjectsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string (optional)
    expand: expand_example,
    // number (optional)
    recent: 56,
    // boolean (optional)
    includeArchived: true,
    // boolean (optional)
    browseArchive: true,
  } satisfies GetAllProjectsRequest;

  try {
    const data = await api.getAllProjects(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **expand** | `string` |  | [Optional] [Defaults to `undefined`] |
| **recent** | `number` |  | [Optional] [Defaults to `undefined`] |
| **includeArchived** | `boolean` |  | [Optional] [Defaults to `undefined`] |
| **browseArchive** | `boolean` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getAllScreens

> { [key: string]: any; } getAllScreens(startAt, maxResults, expand, search)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetAllScreensRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string (optional)
    startAt: startAt_example,
    // string (optional)
    maxResults: maxResults_example,
    // string (optional)
    expand: expand_example,
    // string (optional)
    search: search_example,
  } satisfies GetAllScreensRequest;

  try {
    const data = await api.getAllScreens(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **startAt** | `string` |  | [Optional] [Defaults to `undefined`] |
| **maxResults** | `string` |  | [Optional] [Defaults to `undefined`] |
| **expand** | `string` |  | [Optional] [Defaults to `undefined`] |
| **search** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getAllStatuses

> { [key: string]: any; } getAllStatuses(projectIdOrKey)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetAllStatusesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    projectIdOrKey: projectIdOrKey_example,
  } satisfies GetAllStatusesRequest;

  try {
    const data = await api.getAllStatuses(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **projectIdOrKey** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getAllSystemAvatars

> { [key: string]: any; } getAllSystemAvatars(type)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetAllSystemAvatarsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    type: type_example,
  } satisfies GetAllSystemAvatarsRequest;

  try {
    const data = await api.getAllSystemAvatars(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **type** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **500** | Response 500 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getAllTabs

> { [key: string]: any; } getAllTabs(screenId, projectKey)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetAllTabsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    screenId: 56,
    // string (optional)
    projectKey: projectKey_example,
  } satisfies GetAllTabsRequest;

  try {
    const data = await api.getAllTabs(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **screenId** | `number` |  | [Defaults to `undefined`] |
| **projectKey** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getAllTerminologyEntries

> { [key: string]: any; } getAllTerminologyEntries()



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetAllTerminologyEntriesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  try {
    const data = await api.getAllTerminologyEntries();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getAllWorkflows

> { [key: string]: any; } getAllWorkflows(workflowName)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetAllWorkflowsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string (optional)
    workflowName: workflowName_example,
  } satisfies GetAllWorkflowsRequest;

  try {
    const data = await api.getAllWorkflows(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **workflowName** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getAlternativeIssueTypes

> { [key: string]: any; } getAlternativeIssueTypes(id)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetAlternativeIssueTypesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    id: id_example,
  } satisfies GetAlternativeIssueTypesRequest;

  try {
    const data = await api.getAlternativeIssueTypes(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getAssignedPermissionScheme

> { [key: string]: any; } getAssignedPermissionScheme(projectKeyOrId, expand)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetAssignedPermissionSchemeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    projectKeyOrId: projectKeyOrId_example,
    // string (optional)
    expand: expand_example,
  } satisfies GetAssignedPermissionSchemeRequest;

  try {
    const data = await api.getAssignedPermissionScheme(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **projectKeyOrId** | `string` |  | [Defaults to `undefined`] |
| **expand** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getAssignedPriorityScheme

> { [key: string]: any; } getAssignedPriorityScheme(projectKeyOrId)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetAssignedPrioritySchemeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    projectKeyOrId: projectKeyOrId_example,
  } satisfies GetAssignedPrioritySchemeRequest;

  try {
    const data = await api.getAssignedPriorityScheme(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **projectKeyOrId** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getAssociatedProjects

> { [key: string]: any; } getAssociatedProjects(schemeId, expand)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetAssociatedProjectsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    schemeId: schemeId_example,
    // string (optional)
    expand: expand_example,
  } satisfies GetAssociatedProjectsRequest;

  try {
    const data = await api.getAssociatedProjects(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **schemeId** | `string` |  | [Defaults to `undefined`] |
| **expand** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **201** | Response 201 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getAttachment

> { [key: string]: any; } getAttachment(id)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetAttachmentRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    id: id_example,
  } satisfies GetAttachmentRequest;

  try {
    const data = await api.getAttachment(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getAttachmentMeta

> { [key: string]: any; } getAttachmentMeta()



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetAttachmentMetaRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  try {
    const data = await api.getAttachmentMeta();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getAutoComplete

> { [key: string]: any; } getAutoComplete()



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetAutoCompleteRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  try {
    const data = await api.getAutoComplete();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **500** | Response 500 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getAvailableMetrics

> { [key: string]: any; } getAvailableMetrics()



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetAvailableMetricsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  try {
    const data = await api.getAvailableMetrics();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getAvatars

> { [key: string]: any; } getAvatars(type, owningObjectId)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetAvatarsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    type: type_example,
    // string
    owningObjectId: owningObjectId_example,
  } satisfies GetAvatarsRequest;

  try {
    const data = await api.getAvatars(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **type** | `string` |  | [Defaults to `undefined`] |
| **owningObjectId** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getById

> { [key: string]: any; } getById(id, returnDraftIfExists)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetByIdRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    id: 56,
    // boolean (optional)
    returnDraftIfExists: false,
  } satisfies GetByIdRequest;

  try {
    const data = await api.getById(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `number` |  | [Defaults to `undefined`] |
| **returnDraftIfExists** | `boolean` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getComment

> { [key: string]: any; } getComment(issueIdOrKey, id, expand)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetCommentRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueIdOrKey: issueIdOrKey_example,
    // string
    id: id_example,
    // string (optional)
    expand: expand_example,
  } satisfies GetCommentRequest;

  try {
    const data = await api.getComment(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueIdOrKey** | `string` |  | [Defaults to `undefined`] |
| **id** | `string` |  | [Defaults to `undefined`] |
| **expand** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getComments

> { [key: string]: any; } getComments(issueIdOrKey, startAt, maxResults, orderBy, expand)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetCommentsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueIdOrKey: issueIdOrKey_example,
    // number (optional)
    startAt: 56,
    // number (optional)
    maxResults: 56,
    // string (optional)
    orderBy: orderBy_example,
    // string (optional)
    expand: expand_example,
  } satisfies GetCommentsRequest;

  try {
    const data = await api.getComments(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueIdOrKey** | `string` |  | [Defaults to `undefined`] |
| **startAt** | `number` |  | [Optional] [Defaults to `undefined`] |
| **maxResults** | `number` |  | [Optional] [Defaults to `undefined`] |
| **orderBy** | `string` |  | [Optional] [Defaults to `undefined`] |
| **expand** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getComponent

> { [key: string]: any; } getComponent(id)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetComponentRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    id: id_example,
  } satisfies GetComponentRequest;

  try {
    const data = await api.getComponent(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getComponentRelatedIssues

> { [key: string]: any; } getComponentRelatedIssues(id)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetComponentRelatedIssuesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    id: id_example,
  } satisfies GetComponentRelatedIssuesRequest;

  try {
    const data = await api.getComponentRelatedIssues(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getConfiguration

> { [key: string]: any; } getConfiguration()



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetConfigurationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  try {
    const data = await api.getConfiguration();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getCreateIssueMetaFields

> { [key: string]: any; } getCreateIssueMetaFields(issueTypeId, projectIdOrKey, startAt, maxResults)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetCreateIssueMetaFieldsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueTypeId: issueTypeId_example,
    // string
    projectIdOrKey: projectIdOrKey_example,
    // number (optional)
    startAt: 0,
    // number (optional)
    maxResults: 50,
  } satisfies GetCreateIssueMetaFieldsRequest;

  try {
    const data = await api.getCreateIssueMetaFields(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueTypeId** | `string` |  | [Defaults to `undefined`] |
| **projectIdOrKey** | `string` |  | [Defaults to `undefined`] |
| **startAt** | `number` |  | [Optional] [Defaults to `undefined`] |
| **maxResults** | `number` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getCreateIssueMetaProjectIssueTypes

> { [key: string]: any; } getCreateIssueMetaProjectIssueTypes(projectIdOrKey, startAt, maxResults)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetCreateIssueMetaProjectIssueTypesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    projectIdOrKey: projectIdOrKey_example,
    // number (optional)
    startAt: 0,
    // number (optional)
    maxResults: 50,
  } satisfies GetCreateIssueMetaProjectIssueTypesRequest;

  try {
    const data = await api.getCreateIssueMetaProjectIssueTypes(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **projectIdOrKey** | `string` |  | [Defaults to `undefined`] |
| **startAt** | `number` |  | [Optional] [Defaults to `undefined`] |
| **maxResults** | `number` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getCustomFieldOption

> { [key: string]: any; } getCustomFieldOption(id)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetCustomFieldOptionRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    id: id_example,
  } satisfies GetCustomFieldOptionRequest;

  try {
    const data = await api.getCustomFieldOption(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getCustomFieldOptions

> { [key: string]: any; } getCustomFieldOptions(customFieldId, projectIds, issueTypeIds, query, maxResults, page)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetCustomFieldOptionsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    customFieldId: 56,
    // string (optional)
    projectIds: projectIds_example,
    // string (optional)
    issueTypeIds: issueTypeIds_example,
    // string (optional)
    query: ,
    // number (optional)
    maxResults: 100,
    // number (optional)
    page: 1,
  } satisfies GetCustomFieldOptionsRequest;

  try {
    const data = await api.getCustomFieldOptions(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **customFieldId** | `number` |  | [Defaults to `undefined`] |
| **projectIds** | `string` |  | [Optional] [Defaults to `undefined`] |
| **issueTypeIds** | `string` |  | [Optional] [Defaults to `undefined`] |
| **query** | `string` |  | [Optional] [Defaults to `undefined`] |
| **maxResults** | `number` |  | [Optional] [Defaults to `undefined`] |
| **page** | `number` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getCustomFields

> { [key: string]: any; } getCustomFields(startAt, maxResults, search, projectIds, screenIds, types, sortOrder, sortColumn, lastValueUpdate)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetCustomFieldsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number (optional)
    startAt: 1,
    // number (optional)
    maxResults: 50,
    // string (optional)
    search: search_example,
    // string (optional)
    projectIds: projectIds_example,
    // string (optional)
    screenIds: screenIds_example,
    // string (optional)
    types: types_example,
    // string (optional)
    sortOrder: sortOrder_example,
    // string (optional)
    sortColumn: sortColumn_example,
    // number (optional)
    lastValueUpdate: 56,
  } satisfies GetCustomFieldsRequest;

  try {
    const data = await api.getCustomFields(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **startAt** | `number` |  | [Optional] [Defaults to `undefined`] |
| **maxResults** | `number` |  | [Optional] [Defaults to `undefined`] |
| **search** | `string` |  | [Optional] [Defaults to `undefined`] |
| **projectIds** | `string` |  | [Optional] [Defaults to `undefined`] |
| **screenIds** | `string` |  | [Optional] [Defaults to `undefined`] |
| **types** | `string` |  | [Optional] [Defaults to `undefined`] |
| **sortOrder** | `string` |  | [Optional] [Defaults to `undefined`] |
| **sortColumn** | `string` |  | [Optional] [Defaults to `undefined`] |
| **lastValueUpdate** | `number` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getDashboard

> { [key: string]: any; } getDashboard(id)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetDashboardRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    id: id_example,
  } satisfies GetDashboardRequest;

  try {
    const data = await api.getDashboard(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getDefault

> { [key: string]: any; } getDefault(id, returnDraftIfExists)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetDefaultRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    id: 56,
    // boolean (optional)
    returnDraftIfExists: false,
  } satisfies GetDefaultRequest;

  try {
    const data = await api.getDefault(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `number` |  | [Defaults to `undefined`] |
| **returnDraftIfExists** | `boolean` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getDefaultShareScope

> { [key: string]: any; } getDefaultShareScope()



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetDefaultShareScopeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  try {
    const data = await api.getDefaultShareScope();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getDraftById

> { [key: string]: any; } getDraftById(id)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetDraftByIdRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    id: 56,
  } satisfies GetDraftByIdRequest;

  try {
    const data = await api.getDraftById(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `number` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getDraftDefault

> { [key: string]: any; } getDraftDefault(id)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetDraftDefaultRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    id: 56,
  } satisfies GetDraftDefaultRequest;

  try {
    const data = await api.getDraftDefault(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `number` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getDraftIssueType

> { [key: string]: any; } getDraftIssueType(issueType, id)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetDraftIssueTypeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueType: issueType_example,
    // number
    id: 56,
  } satisfies GetDraftIssueTypeRequest;

  try {
    const data = await api.getDraftIssueType(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueType** | `string` |  | [Defaults to `undefined`] |
| **id** | `number` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getDraftWorkflow

> { [key: string]: any; } getDraftWorkflow(id, workflowName)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetDraftWorkflowRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    id: 56,
    // string (optional)
    workflowName: workflowName_example,
  } satisfies GetDraftWorkflowRequest;

  try {
    const data = await api.getDraftWorkflow(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `number` |  | [Defaults to `undefined`] |
| **workflowName** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getDuplicatedUsersCount

> { [key: string]: any; } getDuplicatedUsersCount(flush)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetDuplicatedUsersCountRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // boolean (optional)
    flush: true,
  } satisfies GetDuplicatedUsersCountRequest;

  try {
    const data = await api.getDuplicatedUsersCount(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **flush** | `boolean` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getDuplicatedUsersMapping

> { [key: string]: any; } getDuplicatedUsersMapping(flush)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetDuplicatedUsersMappingRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // boolean (optional)
    flush: true,
  } satisfies GetDuplicatedUsersMappingRequest;

  try {
    const data = await api.getDuplicatedUsersMapping(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **flush** | `boolean` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getEditIssueMeta

> { [key: string]: any; } getEditIssueMeta(issueIdOrKey)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetEditIssueMetaRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueIdOrKey: issueIdOrKey_example,
  } satisfies GetEditIssueMetaRequest;

  try {
    const data = await api.getEditIssueMeta(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueIdOrKey** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getEmailTypes

> { [key: string]: any; } getEmailTypes()



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetEmailTypesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  try {
    const data = await api.getEmailTypes();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getFavouriteFilters

> { [key: string]: any; } getFavouriteFilters(expand)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetFavouriteFiltersRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string (optional)
    expand: expand_example,
  } satisfies GetFavouriteFiltersRequest;

  try {
    const data = await api.getFavouriteFilters(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **expand** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getFieldAutoCompleteForQueryString

> { [key: string]: any; } getFieldAutoCompleteForQueryString(fieldName, fieldValue, predicateName, predicateValue)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetFieldAutoCompleteForQueryStringRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string (optional)
    fieldName: fieldName_example,
    // string (optional)
    fieldValue: fieldValue_example,
    // string (optional)
    predicateName: predicateName_example,
    // string (optional)
    predicateValue: predicateValue_example,
  } satisfies GetFieldAutoCompleteForQueryStringRequest;

  try {
    const data = await api.getFieldAutoCompleteForQueryString(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **fieldName** | `string` |  | [Optional] [Defaults to `undefined`] |
| **fieldValue** | `string` |  | [Optional] [Defaults to `undefined`] |
| **predicateName** | `string` |  | [Optional] [Defaults to `undefined`] |
| **predicateValue** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getFields

> { [key: string]: any; } getFields()



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetFieldsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  try {
    const data = await api.getFields();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getFieldsToAdd

> { [key: string]: any; } getFieldsToAdd(screenId)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetFieldsToAddRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    screenId: 56,
  } satisfies GetFieldsToAddRequest;

  try {
    const data = await api.getFieldsToAdd(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **screenId** | `number` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getFilter

> { [key: string]: any; } getFilter(id, expand)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetFilterRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    id: 56,
    // string (optional)
    expand: expand_example,
  } satisfies GetFilterRequest;

  try {
    const data = await api.getFilter(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `number` |  | [Defaults to `undefined`] |
| **expand** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getGroup

> { [key: string]: any; } getGroup(groupname, expand)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetGroupRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string (optional)
    groupname: groupname_example,
    // string (optional)
    expand: expand_example,
  } satisfies GetGroupRequest;

  try {
    const data = await api.getGroup(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **groupname** | `string` |  | [Optional] [Defaults to `undefined`] |
| **expand** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getIdsOfWorklogsDeletedSince

> { [key: string]: any; } getIdsOfWorklogsDeletedSince(since)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetIdsOfWorklogsDeletedSinceRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number (optional)
    since: 0,
  } satisfies GetIdsOfWorklogsDeletedSinceRequest;

  try {
    const data = await api.getIdsOfWorklogsDeletedSince(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **since** | `number` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getIdsOfWorklogsModifiedSince

> { [key: string]: any; } getIdsOfWorklogsModifiedSince(since)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetIdsOfWorklogsModifiedSinceRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number (optional)
    since: 0,
  } satisfies GetIdsOfWorklogsModifiedSinceRequest;

  try {
    const data = await api.getIdsOfWorklogsModifiedSince(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **since** | `number` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getIndexSummary

> { [key: string]: any; } getIndexSummary()



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetIndexSummaryRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  try {
    const data = await api.getIndexSummary();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **403** | Response 403 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getIssue

> { [key: string]: any; } getIssue(issueIdOrKey, fields, expand, properties, updateHistory)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetIssueRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueIdOrKey: issueIdOrKey_example,
    // string (optional)
    fields: fields_example,
    // string (optional)
    expand: expand_example,
    // string (optional)
    properties: properties_example,
    // boolean (optional)
    updateHistory: true,
  } satisfies GetIssueRequest;

  try {
    const data = await api.getIssue(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueIdOrKey** | `string` |  | [Defaults to `undefined`] |
| **fields** | `string` |  | [Optional] [Defaults to `undefined`] |
| **expand** | `string` |  | [Optional] [Defaults to `undefined`] |
| **properties** | `string` |  | [Optional] [Defaults to `undefined`] |
| **updateHistory** | `boolean` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getIssueAllTypes

> { [key: string]: any; } getIssueAllTypes()



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetIssueAllTypesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  try {
    const data = await api.getIssueAllTypes();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getIssueLink

> { [key: string]: any; } getIssueLink(linkId)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetIssueLinkRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    linkId: linkId_example,
  } satisfies GetIssueLinkRequest;

  try {
    const data = await api.getIssueLink(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **linkId** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **404** | Response 404 |  -  |
| **500** | Response 500 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getIssueLinkType

> { [key: string]: any; } getIssueLinkType(issueLinkTypeId)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetIssueLinkTypeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueLinkTypeId: issueLinkTypeId_example,
  } satisfies GetIssueLinkTypeRequest;

  try {
    const data = await api.getIssueLinkType(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueLinkTypeId** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getIssueLinkTypes

> { [key: string]: any; } getIssueLinkTypes()



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetIssueLinkTypesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  try {
    const data = await api.getIssueLinkTypes();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getIssueNavigatorDefaultColumns

> { [key: string]: any; } getIssueNavigatorDefaultColumns()



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetIssueNavigatorDefaultColumnsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  try {
    const data = await api.getIssueNavigatorDefaultColumns();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **403** | Response 403 |  -  |
| **500** | Response 500 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getIssuePickerResource

> { [key: string]: any; } getIssuePickerResource(query, currentJQL, currentIssueKey, currentProjectId, showSubTasks, showSubTaskParent)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetIssuePickerResourceRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string (optional)
    query: query_example,
    // string (optional)
    currentJQL: currentJQL_example,
    // string (optional)
    currentIssueKey: currentIssueKey_example,
    // string (optional)
    currentProjectId: currentProjectId_example,
    // boolean (optional)
    showSubTasks: true,
    // boolean (optional)
    showSubTaskParent: true,
  } satisfies GetIssuePickerResourceRequest;

  try {
    const data = await api.getIssuePickerResource(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **query** | `string` |  | [Optional] [Defaults to `undefined`] |
| **currentJQL** | `string` |  | [Optional] [Defaults to `undefined`] |
| **currentIssueKey** | `string` |  | [Optional] [Defaults to `undefined`] |
| **currentProjectId** | `string` |  | [Optional] [Defaults to `undefined`] |
| **showSubTasks** | `boolean` |  | [Optional] [Defaults to `undefined`] |
| **showSubTaskParent** | `boolean` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getIssueSecurityScheme

> { [key: string]: any; } getIssueSecurityScheme(projectKeyOrId)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetIssueSecuritySchemeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    projectKeyOrId: projectKeyOrId_example,
  } satisfies GetIssueSecuritySchemeRequest;

  try {
    const data = await api.getIssueSecurityScheme(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **projectKeyOrId** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getIssueSecurityScheme_0

> { [key: string]: any; } getIssueSecurityScheme_0(id)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetIssueSecurityScheme0Request } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    id: 56,
  } satisfies GetIssueSecurityScheme0Request;

  try {
    const data = await api.getIssueSecurityScheme_0(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `number` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getIssueSecuritySchemes

> { [key: string]: any; } getIssueSecuritySchemes()



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetIssueSecuritySchemesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  try {
    const data = await api.getIssueSecuritySchemes();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getIssueType

> { [key: string]: any; } getIssueType(issueType, id, returnDraftIfExists)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetIssueTypeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueType: issueType_example,
    // number
    id: 56,
    // boolean (optional)
    returnDraftIfExists: false,
  } satisfies GetIssueTypeRequest;

  try {
    const data = await api.getIssueType(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueType** | `string` |  | [Defaults to `undefined`] |
| **id** | `number` |  | [Defaults to `undefined`] |
| **returnDraftIfExists** | `boolean` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getIssueTypeScheme

> { [key: string]: any; } getIssueTypeScheme(schemeId)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetIssueTypeSchemeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    schemeId: schemeId_example,
  } satisfies GetIssueTypeSchemeRequest;

  try {
    const data = await api.getIssueTypeScheme(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **schemeId** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getIssueType_0

> { [key: string]: any; } getIssueType_0(id)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetIssueType0Request } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    id: id_example,
  } satisfies GetIssueType0Request;

  try {
    const data = await api.getIssueType_0(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getIssueWatchers

> { [key: string]: any; } getIssueWatchers(issueIdOrKey)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetIssueWatchersRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueIdOrKey: issueIdOrKey_example,
  } satisfies GetIssueWatchersRequest;

  try {
    const data = await api.getIssueWatchers(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueIdOrKey** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getIssueWorklog

> { [key: string]: any; } getIssueWorklog(issueIdOrKey)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetIssueWorklogRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueIdOrKey: issueIdOrKey_example,
  } satisfies GetIssueWorklogRequest;

  try {
    const data = await api.getIssueWorklog(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueIdOrKey** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getIssuesecuritylevel

> { [key: string]: any; } getIssuesecuritylevel(id)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetIssuesecuritylevelRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    id: id_example,
  } satisfies GetIssuesecuritylevelRequest;

  try {
    const data = await api.getIssuesecuritylevel(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getNotificationScheme

> { [key: string]: any; } getNotificationScheme(id, expand)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetNotificationSchemeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    id: 56,
    // string (optional)
    expand: expand_example,
  } satisfies GetNotificationSchemeRequest;

  try {
    const data = await api.getNotificationScheme(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `number` |  | [Defaults to `undefined`] |
| **expand** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getNotificationScheme_0

> { [key: string]: any; } getNotificationScheme_0(projectKeyOrId, expand)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetNotificationScheme0Request } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    projectKeyOrId: projectKeyOrId_example,
    // string (optional)
    expand: expand_example,
  } satisfies GetNotificationScheme0Request;

  try {
    const data = await api.getNotificationScheme_0(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **projectKeyOrId** | `string` |  | [Defaults to `undefined`] |
| **expand** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getNotificationSchemes

> { [key: string]: any; } getNotificationSchemes(startAt, maxResults, expand)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetNotificationSchemesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number (optional)
    startAt: 56,
    // number (optional)
    maxResults: 56,
    // string (optional)
    expand: expand_example,
  } satisfies GetNotificationSchemesRequest;

  try {
    const data = await api.getNotificationSchemes(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **startAt** | `number` |  | [Optional] [Defaults to `undefined`] |
| **maxResults** | `number` |  | [Optional] [Defaults to `undefined`] |
| **expand** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getPaginatedComponents

> { [key: string]: any; } getPaginatedComponents(startAt, maxResults, query, projectIds)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetPaginatedComponentsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number (optional)
    startAt: 0,
    // number (optional)
    maxResults: 100,
    // string (optional)
    query: ,
    // string (optional)
    projectIds: projectIds_example,
  } satisfies GetPaginatedComponentsRequest;

  try {
    const data = await api.getPaginatedComponents(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **startAt** | `number` |  | [Optional] [Defaults to `undefined`] |
| **maxResults** | `number` |  | [Optional] [Defaults to `undefined`] |
| **query** | `string` |  | [Optional] [Defaults to `undefined`] |
| **projectIds** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getPaginatedIssueTypes

> { [key: string]: any; } getPaginatedIssueTypes(xRequestedWith, startAt, maxResults, query, projectIds)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetPaginatedIssueTypesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string (optional)
    xRequestedWith: xRequestedWith_example,
    // number (optional)
    startAt: 0,
    // number (optional)
    maxResults: 100,
    // string (optional)
    query: ,
    // string (optional)
    projectIds: projectIds_example,
  } satisfies GetPaginatedIssueTypesRequest;

  try {
    const data = await api.getPaginatedIssueTypes(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **xRequestedWith** | `string` |  | [Optional] [Defaults to `undefined`] |
| **startAt** | `number` |  | [Optional] [Defaults to `undefined`] |
| **maxResults** | `number` |  | [Optional] [Defaults to `undefined`] |
| **query** | `string` |  | [Optional] [Defaults to `undefined`] |
| **projectIds** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getPaginatedResolutions

> { [key: string]: any; } getPaginatedResolutions(startAt, maxResults, query)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetPaginatedResolutionsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number (optional)
    startAt: 0,
    // number (optional)
    maxResults: 100,
    // string (optional)
    query: ,
  } satisfies GetPaginatedResolutionsRequest;

  try {
    const data = await api.getPaginatedResolutions(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **startAt** | `number` |  | [Optional] [Defaults to `undefined`] |
| **maxResults** | `number` |  | [Optional] [Defaults to `undefined`] |
| **query** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getPaginatedStatuses

> { [key: string]: any; } getPaginatedStatuses(startAt, maxResults, query, projectIds, issueTypeIds)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetPaginatedStatusesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number (optional)
    startAt: 0,
    // number (optional)
    maxResults: 100,
    // string (optional)
    query: ,
    // string (optional)
    projectIds: projectIds_example,
    // string (optional)
    issueTypeIds: issueTypeIds_example,
  } satisfies GetPaginatedStatusesRequest;

  try {
    const data = await api.getPaginatedStatuses(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **startAt** | `number` |  | [Optional] [Defaults to `undefined`] |
| **maxResults** | `number` |  | [Optional] [Defaults to `undefined`] |
| **query** | `string` |  | [Optional] [Defaults to `undefined`] |
| **projectIds** | `string` |  | [Optional] [Defaults to `undefined`] |
| **issueTypeIds** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getPaginatedVersions

> { [key: string]: any; } getPaginatedVersions(startAt, maxResults, query, projectIds)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetPaginatedVersionsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number (optional)
    startAt: 0,
    // number (optional)
    maxResults: 100,
    // string (optional)
    query: ,
    // string (optional)
    projectIds: projectIds_example,
  } satisfies GetPaginatedVersionsRequest;

  try {
    const data = await api.getPaginatedVersions(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **startAt** | `number` |  | [Optional] [Defaults to `undefined`] |
| **maxResults** | `number` |  | [Optional] [Defaults to `undefined`] |
| **query** | `string` |  | [Optional] [Defaults to `undefined`] |
| **projectIds** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getPasswordPolicy

> { [key: string]: any; } getPasswordPolicy(hasOldPassword)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetPasswordPolicyRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // boolean (optional)
    hasOldPassword: false,
  } satisfies GetPasswordPolicyRequest;

  try {
    const data = await api.getPasswordPolicy(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **hasOldPassword** | `boolean` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getPermissionScheme

> { [key: string]: any; } getPermissionScheme(schemeId, expand)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetPermissionSchemeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    schemeId: 56,
    // string (optional)
    expand: expand_example,
  } satisfies GetPermissionSchemeRequest;

  try {
    const data = await api.getPermissionScheme(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **schemeId** | `number` |  | [Defaults to `undefined`] |
| **expand** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getPermissionSchemeGrant

> { [key: string]: any; } getPermissionSchemeGrant(permissionId, schemeId, expand)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetPermissionSchemeGrantRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    permissionId: 56,
    // number
    schemeId: 56,
    // string (optional)
    expand: expand_example,
  } satisfies GetPermissionSchemeGrantRequest;

  try {
    const data = await api.getPermissionSchemeGrant(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **permissionId** | `number` |  | [Defaults to `undefined`] |
| **schemeId** | `number` |  | [Defaults to `undefined`] |
| **expand** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getPermissionSchemeGrants

> { [key: string]: any; } getPermissionSchemeGrants(schemeId, expand)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetPermissionSchemeGrantsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    schemeId: 56,
    // string (optional)
    expand: expand_example,
  } satisfies GetPermissionSchemeGrantsRequest;

  try {
    const data = await api.getPermissionSchemeGrants(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **schemeId** | `number` |  | [Defaults to `undefined`] |
| **expand** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getPermissionSchemes

> { [key: string]: any; } getPermissionSchemes(expand)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetPermissionSchemesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string (optional)
    expand: expand_example,
  } satisfies GetPermissionSchemesRequest;

  try {
    const data = await api.getPermissionSchemes(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **expand** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getPermissions

> { [key: string]: any; } getPermissions(projectKey, projectId, issueKey, issueId)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetPermissionsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string (optional)
    projectKey: projectKey_example,
    // string (optional)
    projectId: projectId_example,
    // string (optional)
    issueKey: issueKey_example,
    // string (optional)
    issueId: issueId_example,
  } satisfies GetPermissionsRequest;

  try {
    const data = await api.getPermissions(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **projectKey** | `string` |  | [Optional] [Defaults to `undefined`] |
| **projectId** | `string` |  | [Optional] [Defaults to `undefined`] |
| **issueKey** | `string` |  | [Optional] [Defaults to `undefined`] |
| **issueId** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getPinnedComments

> { [key: string]: any; } getPinnedComments(issueIdOrKey)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetPinnedCommentsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueIdOrKey: issueIdOrKey_example,
  } satisfies GetPinnedCommentsRequest;

  try {
    const data = await api.getPinnedComments(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueIdOrKey** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getPreference

> { [key: string]: any; } getPreference(key)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetPreferenceRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string (optional)
    key: key_example,
  } satisfies GetPreferenceRequest;

  try {
    const data = await api.getPreference(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **key** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getPriorities

> { [key: string]: any; } getPriorities()



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetPrioritiesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  try {
    const data = await api.getPriorities();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getPriorities_0

> { [key: string]: any; } getPriorities_0(startAt, maxResults, query, projectIds)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetPriorities0Request } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number (optional)
    startAt: 0,
    // number (optional)
    maxResults: 100,
    // string (optional)
    query: ,
    // string (optional)
    projectIds: projectIds_example,
  } satisfies GetPriorities0Request;

  try {
    const data = await api.getPriorities_0(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **startAt** | `number` |  | [Optional] [Defaults to `undefined`] |
| **maxResults** | `number` |  | [Optional] [Defaults to `undefined`] |
| **query** | `string` |  | [Optional] [Defaults to `undefined`] |
| **projectIds** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getPriority

> { [key: string]: any; } getPriority(id)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetPriorityRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    id: id_example,
  } satisfies GetPriorityRequest;

  try {
    const data = await api.getPriority(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getPriorityScheme

> { [key: string]: any; } getPriorityScheme(schemeId)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetPrioritySchemeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    schemeId: 56,
  } satisfies GetPrioritySchemeRequest;

  try {
    const data = await api.getPriorityScheme(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **schemeId** | `number` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getPrioritySchemes

> { [key: string]: any; } getPrioritySchemes(startAt, maxResults)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetPrioritySchemesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number (optional)
    startAt: 56,
    // number (optional)
    maxResults: 56,
  } satisfies GetPrioritySchemesRequest;

  try {
    const data = await api.getPrioritySchemes(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **startAt** | `number` |  | [Optional] [Defaults to `undefined`] |
| **maxResults** | `number` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **403** | Response 403 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getProgress

> { [key: string]: any; } getProgress(taskId)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetProgressRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number (optional)
    taskId: 56,
  } satisfies GetProgressRequest;

  try {
    const data = await api.getProgress(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **taskId** | `number` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getProgressBulk

> { [key: string]: any; } getProgressBulk(requestId)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetProgressBulkRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string (optional)
    requestId: requestId_example,
  } satisfies GetProgressBulkRequest;

  try {
    const data = await api.getProgressBulk(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **requestId** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getProgress_0

> { [key: string]: any; } getProgress_0(requestId)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetProgress0Request } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    requestId: 56,
  } satisfies GetProgress0Request;

  try {
    const data = await api.getProgress_0(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **requestId** | `number` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getProject

> { [key: string]: any; } getProject(key)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetProjectRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string (optional)
    key: key_example,
  } satisfies GetProjectRequest;

  try {
    const data = await api.getProject(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **key** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getProjectCategoryById

> { [key: string]: any; } getProjectCategoryById(id)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetProjectCategoryByIdRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    id: 56,
  } satisfies GetProjectCategoryByIdRequest;

  try {
    const data = await api.getProjectCategoryById(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `number` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getProjectComponents

> { [key: string]: any; } getProjectComponents(projectIdOrKey)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetProjectComponentsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    projectIdOrKey: projectIdOrKey_example,
  } satisfies GetProjectComponentsRequest;

  try {
    const data = await api.getProjectComponents(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **projectIdOrKey** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getProjectRole

> { [key: string]: any; } getProjectRole(projectIdOrKey, projectIdOrKey2, id)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetProjectRoleRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    projectIdOrKey: projectIdOrKey_example,
    // string
    projectIdOrKey2: projectIdOrKey_example,
    // number
    id: 56,
  } satisfies GetProjectRoleRequest;

  try {
    const data = await api.getProjectRole(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **projectIdOrKey** | `string` |  | [Defaults to `undefined`] |
| **projectIdOrKey2** | `string` |  | [Defaults to `undefined`] |
| **id** | `number` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getProjectRoleActorsForRole

> { [key: string]: any; } getProjectRoleActorsForRole(id)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetProjectRoleActorsForRoleRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    id: 56,
  } satisfies GetProjectRoleActorsForRoleRequest;

  try {
    const data = await api.getProjectRoleActorsForRole(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `number` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getProjectRoles

> { [key: string]: any; } getProjectRoles()



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetProjectRolesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  try {
    const data = await api.getProjectRoles();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getProjectRolesById

> { [key: string]: any; } getProjectRolesById(id)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetProjectRolesByIdRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    id: 56,
  } satisfies GetProjectRolesByIdRequest;

  try {
    const data = await api.getProjectRolesById(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `number` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getProjectRoles_0

> { [key: string]: any; } getProjectRoles_0(projectIdOrKey)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetProjectRoles0Request } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    projectIdOrKey: projectIdOrKey_example,
  } satisfies GetProjectRoles0Request;

  try {
    const data = await api.getProjectRoles_0(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **projectIdOrKey** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getProjectTypeByKey

> { [key: string]: any; } getProjectTypeByKey(projectTypeKey)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetProjectTypeByKeyRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    projectTypeKey: projectTypeKey_example,
  } satisfies GetProjectTypeByKeyRequest;

  try {
    const data = await api.getProjectTypeByKey(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **projectTypeKey** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getProjectVersions

> { [key: string]: any; } getProjectVersions(projectIdOrKey, expand)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetProjectVersionsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    projectIdOrKey: projectIdOrKey_example,
    // string (optional)
    expand: expand_example,
  } satisfies GetProjectVersionsRequest;

  try {
    const data = await api.getProjectVersions(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **projectIdOrKey** | `string` |  | [Defaults to `undefined`] |
| **expand** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getProjectVersionsPaginated

> { [key: string]: any; } getProjectVersionsPaginated(projectIdOrKey, startAt, maxResults, orderBy, expand)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetProjectVersionsPaginatedRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    projectIdOrKey: projectIdOrKey_example,
    // number (optional)
    startAt: 56,
    // number (optional)
    maxResults: 56,
    // string (optional)
    orderBy: orderBy_example,
    // string (optional)
    expand: expand_example,
  } satisfies GetProjectVersionsPaginatedRequest;

  try {
    const data = await api.getProjectVersionsPaginated(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **projectIdOrKey** | `string` |  | [Defaults to `undefined`] |
| **startAt** | `number` |  | [Optional] [Defaults to `undefined`] |
| **maxResults** | `number` |  | [Optional] [Defaults to `undefined`] |
| **orderBy** | `string` |  | [Optional] [Defaults to `undefined`] |
| **expand** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getProject_0

> { [key: string]: any; } getProject_0(projectIdOrKey, expand)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetProject0Request } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    projectIdOrKey: projectIdOrKey_example,
    // string (optional)
    expand: expand_example,
  } satisfies GetProject0Request;

  try {
    const data = await api.getProject_0(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **projectIdOrKey** | `string` |  | [Defaults to `undefined`] |
| **expand** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getProperties

> { [key: string]: any; } getProperties(id, includeReservedKeys, key, workflowName, workflowMode)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetPropertiesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    id: 56,
    // boolean (optional)
    includeReservedKeys: true,
    // string (optional)
    key: key_example,
    // string (optional)
    workflowName: workflowName_example,
    // string (optional)
    workflowMode: workflowMode_example,
  } satisfies GetPropertiesRequest;

  try {
    const data = await api.getProperties(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `number` |  | [Defaults to `undefined`] |
| **includeReservedKeys** | `boolean` |  | [Optional] [Defaults to `undefined`] |
| **key** | `string` |  | [Optional] [Defaults to `undefined`] |
| **workflowName** | `string` |  | [Optional] [Defaults to `undefined`] |
| **workflowMode** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **403** | Response 403 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getPropertiesKeys

> { [key: string]: any; } getPropertiesKeys(itemId, dashboardId)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetPropertiesKeysRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    itemId: itemId_example,
    // string
    dashboardId: dashboardId_example,
  } satisfies GetPropertiesKeysRequest;

  try {
    const data = await api.getPropertiesKeys(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **itemId** | `string` |  | [Defaults to `undefined`] |
| **dashboardId** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getPropertiesKeys_0

> { [key: string]: any; } getPropertiesKeys_0(commentId)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetPropertiesKeys0Request } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    commentId: commentId_example,
  } satisfies GetPropertiesKeys0Request;

  try {
    const data = await api.getPropertiesKeys_0(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **commentId** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getPropertiesKeys_1

> { [key: string]: any; } getPropertiesKeys_1(projectIdOrKey)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetPropertiesKeys1Request } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    projectIdOrKey: projectIdOrKey_example,
  } satisfies GetPropertiesKeys1Request;

  try {
    const data = await api.getPropertiesKeys_1(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **projectIdOrKey** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getPropertiesKeys_2

> { [key: string]: any; } getPropertiesKeys_2(userKey, username)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetPropertiesKeys2Request } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string (optional)
    userKey: userKey_example,
    // string (optional)
    username: username_example,
  } satisfies GetPropertiesKeys2Request;

  try {
    const data = await api.getPropertiesKeys_2(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **userKey** | `string` |  | [Optional] [Defaults to `undefined`] |
| **username** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getPropertiesKeys_3

> { [key: string]: any; } getPropertiesKeys_3(issueIdOrKey)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetPropertiesKeys3Request } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueIdOrKey: issueIdOrKey_example,
  } satisfies GetPropertiesKeys3Request;

  try {
    const data = await api.getPropertiesKeys_3(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueIdOrKey** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getProperty

> { [key: string]: any; } getProperty(issueTypeId, propertyKey, issueTypeId2)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetPropertyRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueTypeId: issueTypeId_example,
    // string
    propertyKey: propertyKey_example,
    // string
    issueTypeId2: issueTypeId_example,
  } satisfies GetPropertyRequest;

  try {
    const data = await api.getProperty(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueTypeId** | `string` |  | [Defaults to `undefined`] |
| **propertyKey** | `string` |  | [Defaults to `undefined`] |
| **issueTypeId2** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getPropertyKeys

> { [key: string]: any; } getPropertyKeys(issueTypeId)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetPropertyKeysRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueTypeId: issueTypeId_example,
  } satisfies GetPropertyKeysRequest;

  try {
    const data = await api.getPropertyKeys(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueTypeId** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getProperty_0

> { [key: string]: any; } getProperty_0(itemId, dashboardId, propertyKey, itemId2, dashboardId2)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetProperty0Request } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    itemId: itemId_example,
    // string
    dashboardId: dashboardId_example,
    // string
    propertyKey: propertyKey_example,
    // string
    itemId2: itemId_example,
    // string
    dashboardId2: dashboardId_example,
  } satisfies GetProperty0Request;

  try {
    const data = await api.getProperty_0(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **itemId** | `string` |  | [Defaults to `undefined`] |
| **dashboardId** | `string` |  | [Defaults to `undefined`] |
| **propertyKey** | `string` |  | [Defaults to `undefined`] |
| **itemId2** | `string` |  | [Defaults to `undefined`] |
| **dashboardId2** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getProperty_1

> { [key: string]: any; } getProperty_1(key, permissionLevel, keyFilter)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetProperty1Request } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string (optional)
    key: key_example,
    // string (optional)
    permissionLevel: permissionLevel_example,
    // string (optional)
    keyFilter: keyFilter_example,
  } satisfies GetProperty1Request;

  try {
    const data = await api.getProperty_1(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **key** | `string` |  | [Optional] [Defaults to `undefined`] |
| **permissionLevel** | `string` |  | [Optional] [Defaults to `undefined`] |
| **keyFilter** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getProperty_2

> { [key: string]: any; } getProperty_2(commentId, propertyKey, commentId2)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetProperty2Request } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    commentId: commentId_example,
    // string
    propertyKey: propertyKey_example,
    // string
    commentId2: commentId_example,
  } satisfies GetProperty2Request;

  try {
    const data = await api.getProperty_2(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **commentId** | `string` |  | [Defaults to `undefined`] |
| **propertyKey** | `string` |  | [Defaults to `undefined`] |
| **commentId2** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getProperty_3

> { [key: string]: any; } getProperty_3(projectIdOrKey, propertyKey, projectIdOrKey2)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetProperty3Request } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    projectIdOrKey: projectIdOrKey_example,
    // string
    propertyKey: propertyKey_example,
    // string
    projectIdOrKey2: projectIdOrKey_example,
  } satisfies GetProperty3Request;

  try {
    const data = await api.getProperty_3(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **projectIdOrKey** | `string` |  | [Defaults to `undefined`] |
| **propertyKey** | `string` |  | [Defaults to `undefined`] |
| **projectIdOrKey2** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getProperty_4

> { [key: string]: any; } getProperty_4(propertyKey, userKey, username)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetProperty4Request } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    propertyKey: propertyKey_example,
    // string (optional)
    userKey: userKey_example,
    // string (optional)
    username: username_example,
  } satisfies GetProperty4Request;

  try {
    const data = await api.getProperty_4(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **propertyKey** | `string` |  | [Defaults to `undefined`] |
| **userKey** | `string` |  | [Optional] [Defaults to `undefined`] |
| **username** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getProperty_5

> { [key: string]: any; } getProperty_5(issueIdOrKey, propertyKey, issueIdOrKey2)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetProperty5Request } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueIdOrKey: issueIdOrKey_example,
    // string
    propertyKey: propertyKey_example,
    // string
    issueIdOrKey2: issueIdOrKey_example,
  } satisfies GetProperty5Request;

  try {
    const data = await api.getProperty_5(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueIdOrKey** | `string` |  | [Defaults to `undefined`] |
| **propertyKey** | `string` |  | [Defaults to `undefined`] |
| **issueIdOrKey2** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getRecords

> { [key: string]: any; } getRecords(offset, limit, filter, from, to, projectIds, userIds)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetRecordsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number (optional)
    offset: 56,
    // number (optional)
    limit: 56,
    // string (optional)
    filter: filter_example,
    // string (optional)
    from: from_example,
    // string (optional)
    to: to_example,
    // string (optional)
    projectIds: projectIds_example,
    // string (optional)
    userIds: userIds_example,
  } satisfies GetRecordsRequest;

  try {
    const data = await api.getRecords(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **offset** | `number` |  | [Optional] [Defaults to `undefined`] |
| **limit** | `number` |  | [Optional] [Defaults to `undefined`] |
| **filter** | `string` |  | [Optional] [Defaults to `undefined`] |
| **from** | `string` |  | [Optional] [Defaults to `undefined`] |
| **to** | `string` |  | [Optional] [Defaults to `undefined`] |
| **projectIds** | `string` |  | [Optional] [Defaults to `undefined`] |
| **userIds** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **403** | Response 403 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getReindexInfo

> { [key: string]: any; } getReindexInfo(taskId)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetReindexInfoRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number (optional)
    taskId: 56,
  } satisfies GetReindexInfoRequest;

  try {
    const data = await api.getReindexInfo(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **taskId** | `number` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getReindexProgress

> { [key: string]: any; } getReindexProgress(taskId)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetReindexProgressRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number (optional)
    taskId: 56,
  } satisfies GetReindexProgressRequest;

  try {
    const data = await api.getReindexProgress(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **taskId** | `number` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getRemoteIssueLinkById

> { [key: string]: any; } getRemoteIssueLinkById(linkId, issueIdOrKey)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetRemoteIssueLinkByIdRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    linkId: linkId_example,
    // string
    issueIdOrKey: issueIdOrKey_example,
  } satisfies GetRemoteIssueLinkByIdRequest;

  try {
    const data = await api.getRemoteIssueLinkById(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **linkId** | `string` |  | [Defaults to `undefined`] |
| **issueIdOrKey** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getRemoteIssueLinks

> { [key: string]: any; } getRemoteIssueLinks(issueIdOrKey, globalId)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetRemoteIssueLinksRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueIdOrKey: issueIdOrKey_example,
    // string (optional)
    globalId: globalId_example,
  } satisfies GetRemoteIssueLinksRequest;

  try {
    const data = await api.getRemoteIssueLinks(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueIdOrKey** | `string` |  | [Defaults to `undefined`] |
| **globalId** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getRemoteVersionLink

> { [key: string]: any; } getRemoteVersionLink(versionId, globalId)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetRemoteVersionLinkRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    versionId: versionId_example,
    // string
    globalId: globalId_example,
  } satisfies GetRemoteVersionLinkRequest;

  try {
    const data = await api.getRemoteVersionLink(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **versionId** | `string` |  | [Defaults to `undefined`] |
| **globalId** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getRemoteVersionLinks

> { [key: string]: any; } getRemoteVersionLinks(globalId)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetRemoteVersionLinksRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string (optional)
    globalId: globalId_example,
  } satisfies GetRemoteVersionLinksRequest;

  try {
    const data = await api.getRemoteVersionLinks(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **globalId** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getRemoteVersionLinksByVersionId

> { [key: string]: any; } getRemoteVersionLinksByVersionId(versionId)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetRemoteVersionLinksByVersionIdRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    versionId: versionId_example,
  } satisfies GetRemoteVersionLinksByVersionIdRequest;

  try {
    const data = await api.getRemoteVersionLinksByVersionId(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **versionId** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getResolution

> { [key: string]: any; } getResolution(id)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetResolutionRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    id: id_example,
  } satisfies GetResolutionRequest;

  try {
    const data = await api.getResolution(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getResolutions

> { [key: string]: any; } getResolutions()



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetResolutionsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  try {
    const data = await api.getResolutions();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getSchemeAttribute

> { [key: string]: any; } getSchemeAttribute(permissionSchemeId, attributeKey)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetSchemeAttributeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    permissionSchemeId: 56,
    // string
    attributeKey: attributeKey_example,
  } satisfies GetSchemeAttributeRequest;

  try {
    const data = await api.getSchemeAttribute(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **permissionSchemeId** | `number` |  | [Defaults to `undefined`] |
| **attributeKey** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getSecurityLevelsForProject

> { [key: string]: any; } getSecurityLevelsForProject(projectKeyOrId)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetSecurityLevelsForProjectRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    projectKeyOrId: projectKeyOrId_example,
  } satisfies GetSecurityLevelsForProjectRequest;

  try {
    const data = await api.getSecurityLevelsForProject(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **projectKeyOrId** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getServerInfo

> { [key: string]: any; } getServerInfo(doHealthCheck)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetServerInfoRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // boolean (optional)
    doHealthCheck: true,
  } satisfies GetServerInfoRequest;

  try {
    const data = await api.getServerInfo(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **doHealthCheck** | `boolean` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getSharePermission

> { [key: string]: any; } getSharePermission(permissionId, id)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetSharePermissionRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    permissionId: 56,
    // number
    id: 56,
  } satisfies GetSharePermissionRequest;

  try {
    const data = await api.getSharePermission(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **permissionId** | `number` |  | [Defaults to `undefined`] |
| **id** | `number` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getSharePermissions

> { [key: string]: any; } getSharePermissions(id)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetSharePermissionsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    id: 56,
  } satisfies GetSharePermissionsRequest;

  try {
    const data = await api.getSharePermissions(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `number` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getState

> { [key: string]: any; } getState()



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetStateRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  try {
    const data = await api.getState();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getStatus

> { [key: string]: any; } getStatus(idOrName)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetStatusRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    idOrName: idOrName_example,
  } satisfies GetStatusRequest;

  try {
    const data = await api.getStatus(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **idOrName** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getStatusCategories

> { [key: string]: any; } getStatusCategories()



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetStatusCategoriesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  try {
    const data = await api.getStatusCategories();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getStatusCategory

> { [key: string]: any; } getStatusCategory(idOrKey)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetStatusCategoryRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    idOrKey: idOrKey_example,
  } satisfies GetStatusCategoryRequest;

  try {
    const data = await api.getStatusCategory(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **idOrKey** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getStatuses

> { [key: string]: any; } getStatuses()



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetStatusesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  try {
    const data = await api.getStatuses();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getSubTasks

> { [key: string]: any; } getSubTasks(issueIdOrKey)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetSubTasksRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueIdOrKey: issueIdOrKey_example,
  } satisfies GetSubTasksRequest;

  try {
    const data = await api.getSubTasks(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueIdOrKey** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getTerminologyEntry

> getTerminologyEntry(originalName)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetTerminologyEntryRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    originalName: originalName_example,
  } satisfies GetTerminologyEntryRequest;

  try {
    const data = await api.getTerminologyEntry(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **originalName** | `string` |  | [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getTransitions

> { [key: string]: any; } getTransitions(issueIdOrKey, transitionId)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetTransitionsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueIdOrKey: issueIdOrKey_example,
    // string (optional)
    transitionId: transitionId_example,
  } satisfies GetTransitionsRequest;

  try {
    const data = await api.getTransitions(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueIdOrKey** | `string` |  | [Defaults to `undefined`] |
| **transitionId** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getUpgradeResult

> { [key: string]: any; } getUpgradeResult()



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetUpgradeResultRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  try {
    const data = await api.getUpgradeResult();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **303** | Response 303 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getUser

> { [key: string]: any; } getUser(username, key, includeDeleted)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetUserRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string (optional)
    username: username_example,
    // string (optional)
    key: key_example,
    // boolean (optional)
    includeDeleted: false,
  } satisfies GetUserRequest;

  try {
    const data = await api.getUser(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **username** | `string` |  | [Optional] [Defaults to `undefined`] |
| **key** | `string` |  | [Optional] [Defaults to `undefined`] |
| **includeDeleted** | `boolean` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getUser_0

> { [key: string]: any; } getUser_0()



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetUser0Request } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  try {
    const data = await api.getUser_0();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getUsersFromGroup

> { [key: string]: any; } getUsersFromGroup(groupname, includeInactiveUsers, startAt, maxResults)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetUsersFromGroupRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string (optional)
    groupname: groupname_example,
    // boolean (optional)
    includeInactiveUsers: false,
    // number (optional)
    startAt: 0,
    // number (optional)
    maxResults: 50,
  } satisfies GetUsersFromGroupRequest;

  try {
    const data = await api.getUsersFromGroup(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **groupname** | `string` |  | [Optional] [Defaults to `undefined`] |
| **includeInactiveUsers** | `boolean` |  | [Optional] [Defaults to `undefined`] |
| **startAt** | `number` |  | [Optional] [Defaults to `undefined`] |
| **maxResults** | `number` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getVersion

> { [key: string]: any; } getVersion(id, expand)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetVersionRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    id: id_example,
    // string (optional)
    expand: expand_example,
  } satisfies GetVersionRequest;

  try {
    const data = await api.getVersion(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |
| **expand** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getVersionRelatedIssues

> { [key: string]: any; } getVersionRelatedIssues(id)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetVersionRelatedIssuesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    id: id_example,
  } satisfies GetVersionRelatedIssuesRequest;

  try {
    const data = await api.getVersionRelatedIssues(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getVersionUnresolvedIssues

> { [key: string]: any; } getVersionUnresolvedIssues(id)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetVersionUnresolvedIssuesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    id: id_example,
  } satisfies GetVersionUnresolvedIssuesRequest;

  try {
    const data = await api.getVersionUnresolvedIssues(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getVotes

> { [key: string]: any; } getVotes(issueIdOrKey)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetVotesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueIdOrKey: issueIdOrKey_example,
  } satisfies GetVotesRequest;

  try {
    const data = await api.getVotes(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueIdOrKey** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getWorkflow

> { [key: string]: any; } getWorkflow(id, workflowName, returnDraftIfExists)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetWorkflowRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    id: 56,
    // string (optional)
    workflowName: workflowName_example,
    // boolean (optional)
    returnDraftIfExists: false,
  } satisfies GetWorkflowRequest;

  try {
    const data = await api.getWorkflow(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `number` |  | [Defaults to `undefined`] |
| **workflowName** | `string` |  | [Optional] [Defaults to `undefined`] |
| **returnDraftIfExists** | `boolean` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getWorkflowSchemeForProject

> { [key: string]: any; } getWorkflowSchemeForProject(projectKeyOrId)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetWorkflowSchemeForProjectRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    projectKeyOrId: projectKeyOrId_example,
  } satisfies GetWorkflowSchemeForProjectRequest;

  try {
    const data = await api.getWorkflowSchemeForProject(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **projectKeyOrId** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getWorklog

> { [key: string]: any; } getWorklog(issueIdOrKey, id)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetWorklogRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueIdOrKey: issueIdOrKey_example,
    // string
    id: id_example,
  } satisfies GetWorklogRequest;

  try {
    const data = await api.getWorklog(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueIdOrKey** | `string` |  | [Defaults to `undefined`] |
| **id** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getWorklogsForIds

> { [key: string]: any; } getWorklogsForIds(requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { GetWorklogsForIdsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies GetWorklogsForIdsRequest;

  try {
    const data = await api.getWorklogsForIds(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## isAppMonitoringEnabled

> { [key: string]: any; } isAppMonitoringEnabled()



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { IsAppMonitoringEnabledRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  try {
    const data = await api.isAppMonitoringEnabled();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## isIndexSnapshotRunning

> { [key: string]: any; } isIndexSnapshotRunning()



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { IsIndexSnapshotRunningRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  try {
    const data = await api.isIndexSnapshotRunning();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## isIpdMonitoringEnabled

> { [key: string]: any; } isIpdMonitoringEnabled()



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { IsIpdMonitoringEnabledRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  try {
    const data = await api.isIpdMonitoringEnabled();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## linkIssues

> { [key: string]: any; } linkIssues(requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { LinkIssuesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies LinkIssuesRequest;

  try {
    const data = await api.linkIssues(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Response 201 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **404** | Response 404 |  -  |
| **500** | Response 500 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## list

> { [key: string]: any; } list(filter, startAt, maxResults)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { ListRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string (optional)
    filter: filter_example,
    // number (optional)
    startAt: 56,
    // number (optional)
    maxResults: 56,
  } satisfies ListRequest;

  try {
    const data = await api.list(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **filter** | `string` |  | [Optional] [Defaults to `undefined`] |
| **startAt** | `number` |  | [Optional] [Defaults to `undefined`] |
| **maxResults** | `number` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## listIndexSnapshot

> { [key: string]: any; } listIndexSnapshot()



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { ListIndexSnapshotRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  try {
    const data = await api.listIndexSnapshot();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## merge

> { [key: string]: any; } merge(moveIssuesTo, id)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { MergeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    moveIssuesTo: moveIssuesTo_example,
    // string
    id: id_example,
  } satisfies MergeRequest;

  try {
    const data = await api.merge(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **moveIssuesTo** | `string` |  | [Defaults to `undefined`] |
| **id** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## moveField

> { [key: string]: any; } moveField(screenId, tabId, id, requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { MoveFieldRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    screenId: 56,
    // number
    tabId: 56,
    // string
    id: id_example,
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies MoveFieldRequest;

  try {
    const data = await api.moveField(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **screenId** | `number` |  | [Defaults to `undefined`] |
| **tabId** | `number` |  | [Defaults to `undefined`] |
| **id** | `string` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Response 201 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## moveSubTasks

> { [key: string]: any; } moveSubTasks(issueIdOrKey, issueIdOrKey2, requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { MoveSubTasksRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueIdOrKey: issueIdOrKey_example,
    // string
    issueIdOrKey2: issueIdOrKey_example,
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies MoveSubTasksRequest;

  try {
    const data = await api.moveSubTasks(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueIdOrKey** | `string` |  | [Defaults to `undefined`] |
| **issueIdOrKey2** | `string` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **400** | Response 400 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## moveTab

> { [key: string]: any; } moveTab(screenId, tabId, pos)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { MoveTabRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    screenId: 56,
    // number
    tabId: 56,
    // number
    pos: 56,
  } satisfies MoveTabRequest;

  try {
    const data = await api.moveTab(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **screenId** | `number` |  | [Defaults to `undefined`] |
| **tabId** | `number` |  | [Defaults to `undefined`] |
| **pos** | `number` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Response 201 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## moveVersion

> { [key: string]: any; } moveVersion(id, requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { MoveVersionRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    id: id_example,
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies MoveVersionRequest;

  try {
    const data = await api.moveVersion(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## notify

> { [key: string]: any; } notify(issueIdOrKey, requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { NotifyRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueIdOrKey: issueIdOrKey_example,
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies NotifyRequest;

  try {
    const data = await api.notify(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueIdOrKey** | `string` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **400** | Response 400 |  -  |
| **403** | Response 403 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## partialUpdateProjectRole

> { [key: string]: any; } partialUpdateProjectRole(id, requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { PartialUpdateProjectRoleRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    id: 56,
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies PartialUpdateProjectRoleRequest;

  try {
    const data = await api.partialUpdateProjectRole(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `number` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## policyCheckCreateUser

> { [key: string]: any; } policyCheckCreateUser(requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { PolicyCheckCreateUserRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies PolicyCheckCreateUserRequest;

  try {
    const data = await api.policyCheckCreateUser(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## policyCheckUpdateUser

> { [key: string]: any; } policyCheckUpdateUser(requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { PolicyCheckUpdateUserRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies PolicyCheckUpdateUserRequest;

  try {
    const data = await api.policyCheckUpdateUser(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## processRequests

> { [key: string]: any; } processRequests()



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { ProcessRequestsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  try {
    const data = await api.processRequests();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## put

> { [key: string]: any; } put(key, requestBody, ifMatch)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { PutRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    key: key_example,
    // { [key: string]: any; }
    requestBody: Object,
    // string (optional)
    ifMatch: ifMatch_example,
  } satisfies PutRequest;

  try {
    const data = await api.put(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **key** | `string` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |
| **ifMatch** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |
| **412** | Response 412 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## putBulk

> { [key: string]: any; } putBulk(requestBody, ifMatch)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { PutBulkRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // { [key: string]: any; }
    requestBody: Object,
    // string (optional)
    ifMatch: ifMatch_example,
  } satisfies PutBulkRequest;

  try {
    const data = await api.putBulk(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **requestBody** | `{ [key: string]: any; }` |  | |
| **ifMatch** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |
| **412** | Response 412 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## reindex

> { [key: string]: any; } reindex(type, indexComments, indexChangeHistory, indexWorklogs)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { ReindexRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string (optional)
    type: type_example,
    // boolean (optional)
    indexComments: false,
    // boolean (optional)
    indexChangeHistory: false,
    // boolean (optional)
    indexWorklogs: false,
  } satisfies ReindexRequest;

  try {
    const data = await api.reindex(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **type** | `string` |  | [Optional] [Defaults to `undefined`] |
| **indexComments** | `boolean` |  | [Optional] [Defaults to `undefined`] |
| **indexChangeHistory** | `boolean` |  | [Optional] [Defaults to `undefined`] |
| **indexWorklogs** | `boolean` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **202** | Response 202 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## reindexIssues

> { [key: string]: any; } reindexIssues(issueId, indexComments, indexChangeHistory, indexWorklogs)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { ReindexIssuesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string (optional)
    issueId: issueId_example,
    // boolean (optional)
    indexComments: false,
    // boolean (optional)
    indexChangeHistory: false,
    // boolean (optional)
    indexWorklogs: false,
  } satisfies ReindexIssuesRequest;

  try {
    const data = await api.reindexIssues(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueId** | `string` |  | [Optional] [Defaults to `undefined`] |
| **indexComments** | `boolean` |  | [Optional] [Defaults to `undefined`] |
| **indexChangeHistory** | `boolean` |  | [Optional] [Defaults to `undefined`] |
| **indexWorklogs** | `boolean` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **202** | Response 202 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## removeAllProjectAssociations

> { [key: string]: any; } removeAllProjectAssociations(schemeId)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { RemoveAllProjectAssociationsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    schemeId: schemeId_example,
  } satisfies RemoveAllProjectAssociationsRequest;

  try {
    const data = await api.removeAllProjectAssociations(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **schemeId** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Response 201 |  -  |
| **204** | Response 204 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## removeAttachment

> { [key: string]: any; } removeAttachment(id)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { RemoveAttachmentRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    id: id_example,
  } satisfies RemoveAttachmentRequest;

  try {
    const data = await api.removeAttachment(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## removeField

> { [key: string]: any; } removeField(screenId, tabId, id)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { RemoveFieldRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    screenId: 56,
    // number
    tabId: 56,
    // string
    id: id_example,
  } satisfies RemoveFieldRequest;

  try {
    const data = await api.removeField(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **screenId** | `number` |  | [Defaults to `undefined`] |
| **tabId** | `number` |  | [Defaults to `undefined`] |
| **id** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Response 201 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## removeGroup

> { [key: string]: any; } removeGroup(groupname, swapGroup)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { RemoveGroupRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string (optional)
    groupname: groupname_example,
    // string (optional)
    swapGroup: swapGroup_example,
  } satisfies RemoveGroupRequest;

  try {
    const data = await api.removeGroup(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **groupname** | `string` |  | [Optional] [Defaults to `undefined`] |
| **swapGroup** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## removePreference

> { [key: string]: any; } removePreference(key)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { RemovePreferenceRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string (optional)
    key: key_example,
  } satisfies RemovePreferenceRequest;

  try {
    const data = await api.removePreference(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **key** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## removeProjectAssociation

> { [key: string]: any; } removeProjectAssociation(projIdOrKey, schemeId)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { RemoveProjectAssociationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    projIdOrKey: projIdOrKey_example,
    // string
    schemeId: schemeId_example,
  } satisfies RemoveProjectAssociationRequest;

  try {
    const data = await api.removeProjectAssociation(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **projIdOrKey** | `string` |  | [Defaults to `undefined`] |
| **schemeId** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Response 201 |  -  |
| **204** | Response 204 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## removeProjectCategory

> { [key: string]: any; } removeProjectCategory(id)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { RemoveProjectCategoryRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    id: 56,
  } satisfies RemoveProjectCategoryRequest;

  try {
    const data = await api.removeProjectCategory(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `number` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## removeUser

> { [key: string]: any; } removeUser(username, key)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { RemoveUserRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string (optional)
    username: username_example,
    // string (optional)
    key: key_example,
  } satisfies RemoveUserRequest;

  try {
    const data = await api.removeUser(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **username** | `string` |  | [Optional] [Defaults to `undefined`] |
| **key** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## removeUserFromApplication

> { [key: string]: any; } removeUserFromApplication(username, applicationKey)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { RemoveUserFromApplicationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string (optional)
    username: username_example,
    // string (optional)
    applicationKey: applicationKey_example,
  } satisfies RemoveUserFromApplicationRequest;

  try {
    const data = await api.removeUserFromApplication(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **username** | `string` |  | [Optional] [Defaults to `undefined`] |
| **applicationKey** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## removeUserFromGroup

> { [key: string]: any; } removeUserFromGroup(groupname, username)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { RemoveUserFromGroupRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string (optional)
    groupname: groupname_example,
    // string (optional)
    username: username_example,
  } satisfies RemoveUserFromGroupRequest;

  try {
    const data = await api.removeUserFromGroup(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **groupname** | `string` |  | [Optional] [Defaults to `undefined`] |
| **username** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## removeVote

> { [key: string]: any; } removeVote(issueIdOrKey)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { RemoveVoteRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueIdOrKey: issueIdOrKey_example,
  } satisfies RemoveVoteRequest;

  try {
    const data = await api.removeVote(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueIdOrKey** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## removeWatcher

> { [key: string]: any; } removeWatcher(issueIdOrKey, username)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { RemoveWatcherRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueIdOrKey: issueIdOrKey_example,
    // string (optional)
    username: username_example,
  } satisfies RemoveWatcherRequest;

  try {
    const data = await api.removeWatcher(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueIdOrKey** | `string` |  | [Defaults to `undefined`] |
| **username** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## renameTab

> { [key: string]: any; } renameTab(screenId, tabId, requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { RenameTabRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    screenId: 56,
    // number
    tabId: 56,
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies RenameTabRequest;

  try {
    const data = await api.renameTab(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **screenId** | `number` |  | [Defaults to `undefined`] |
| **tabId** | `number` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## requestCurrentIndexFromNode

> requestCurrentIndexFromNode(nodeId)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { RequestCurrentIndexFromNodeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    nodeId: nodeId_example,
  } satisfies RequestCurrentIndexFromNodeRequest;

  try {
    const data = await api.requestCurrentIndexFromNode(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **nodeId** | `string` |  | [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **401** | Response 401 |  -  |
| **404** | Response 404 |  -  |
| **405** | Response 405 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## resetColumns

> { [key: string]: any; } resetColumns(id)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { ResetColumnsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    id: 56,
  } satisfies ResetColumnsRequest;

  try {
    const data = await api.resetColumns(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `number` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **500** | Response 500 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## resetColumns_0

> { [key: string]: any; } resetColumns_0(username)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { ResetColumns0Request } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string (optional)
    username: username_example,
  } satisfies ResetColumns0Request;

  try {
    const data = await api.resetColumns_0(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **username** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **401** | Response 401 |  -  |
| **500** | Response 500 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## restoreIssue

> { [key: string]: any; } restoreIssue(issueIdOrKey, notifyUsers)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { RestoreIssueRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueIdOrKey: issueIdOrKey_example,
    // boolean (optional)
    notifyUsers: true,
  } satisfies RestoreIssueRequest;

  try {
    const data = await api.restoreIssue(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueIdOrKey** | `string` |  | [Defaults to `undefined`] |
| **notifyUsers** | `boolean` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## restoreProject

> { [key: string]: any; } restoreProject(projectIdOrKey)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { RestoreProjectRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    projectIdOrKey: projectIdOrKey_example,
  } satisfies RestoreProjectRequest;

  try {
    const data = await api.restoreProject(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **projectIdOrKey** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **202** | Response 202 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## revertEmailTemplatesToDefault

> { [key: string]: any; } revertEmailTemplatesToDefault()



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { RevertEmailTemplatesToDefaultRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  try {
    const data = await api.revertEmailTemplatesToDefault();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## runUpgradesNow

> { [key: string]: any; } runUpgradesNow()



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { RunUpgradesNowRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  try {
    const data = await api.runUpgradesNow();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## scheduleUserAnonymization

> { [key: string]: any; } scheduleUserAnonymization(requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { ScheduleUserAnonymizationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies ScheduleUserAnonymizationRequest;

  try {
    const data = await api.scheduleUserAnonymization(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **202** | Response 202 |  -  |
| **400** | Response 400 |  -  |
| **403** | Response 403 |  -  |
| **409** | Response 409 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## scheduleUserAnonymizationRerun

> { [key: string]: any; } scheduleUserAnonymizationRerun(requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { ScheduleUserAnonymizationRerunRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies ScheduleUserAnonymizationRerunRequest;

  try {
    const data = await api.scheduleUserAnonymizationRerun(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **202** | Response 202 |  -  |
| **400** | Response 400 |  -  |
| **403** | Response 403 |  -  |
| **409** | Response 409 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## search

> { [key: string]: any; } search(jql, startAt, maxResults, validateQuery, fields, expand)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { SearchRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string (optional)
    jql: jql_example,
    // number (optional)
    startAt: 56,
    // number (optional)
    maxResults: 56,
    // boolean (optional)
    validateQuery: true,
    // string (optional)
    fields: fields_example,
    // string (optional)
    expand: expand_example,
  } satisfies SearchRequest;

  try {
    const data = await api.search(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **jql** | `string` |  | [Optional] [Defaults to `undefined`] |
| **startAt** | `number` |  | [Optional] [Defaults to `undefined`] |
| **maxResults** | `number` |  | [Optional] [Defaults to `undefined`] |
| **validateQuery** | `boolean` |  | [Optional] [Defaults to `undefined`] |
| **fields** | `string` |  | [Optional] [Defaults to `undefined`] |
| **expand** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## searchForProjects

> { [key: string]: any; } searchForProjects(query, maxResults, allowEmptyQuery)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { SearchForProjectsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string (optional)
    query: ,
    // number (optional)
    maxResults: 0,
    // boolean (optional)
    allowEmptyQuery: false,
  } satisfies SearchForProjectsRequest;

  try {
    const data = await api.searchForProjects(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **query** | `string` |  | [Optional] [Defaults to `undefined`] |
| **maxResults** | `number` |  | [Optional] [Defaults to `undefined`] |
| **allowEmptyQuery** | `boolean` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## searchUsingSearchRequest

> { [key: string]: any; } searchUsingSearchRequest(requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { SearchUsingSearchRequestRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies SearchUsingSearchRequestRequest;

  try {
    const data = await api.searchUsingSearchRequest(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## setActors

> { [key: string]: any; } setActors(projectIdOrKey, projectIdOrKey2, id, requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { SetActorsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    projectIdOrKey: projectIdOrKey_example,
    // string
    projectIdOrKey2: projectIdOrKey_example,
    // number
    id: 56,
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies SetActorsRequest;

  try {
    const data = await api.setActors(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **projectIdOrKey** | `string` |  | [Defaults to `undefined`] |
| **projectIdOrKey2** | `string` |  | [Defaults to `undefined`] |
| **id** | `number` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## setAppMonitoringEnabled

> { [key: string]: any; } setAppMonitoringEnabled(requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { SetAppMonitoringEnabledRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies SetAppMonitoringEnabledRequest;

  try {
    const data = await api.setAppMonitoringEnabled(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## setAppMonitoringEnabled_0

> { [key: string]: any; } setAppMonitoringEnabled_0(requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { SetAppMonitoringEnabled0Request } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies SetAppMonitoringEnabled0Request;

  try {
    const data = await api.setAppMonitoringEnabled_0(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## setBaseURL

> setBaseURL(requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { SetBaseURLRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies SetBaseURLRequest;

  try {
    const data = await api.setBaseURL(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

`void` (Empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **0** | Default response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## setColumns

> { [key: string]: any; } setColumns(id)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { SetColumnsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    id: 56,
  } satisfies SetColumnsRequest;

  try {
    const data = await api.setColumns(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `number` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/x-www-form-urlencoded`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **500** | Response 500 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## setColumns_0

> { [key: string]: any; } setColumns_0()



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { SetColumns0Request } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  try {
    const data = await api.setColumns_0();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/x-www-form-urlencoded`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **500** | Response 500 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## setDefaultShareScope

> { [key: string]: any; } setDefaultShareScope(requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { SetDefaultShareScopeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies SetDefaultShareScopeRequest;

  try {
    const data = await api.setDefaultShareScope(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## setDraftIssueType

> { [key: string]: any; } setDraftIssueType(issueType, id, requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { SetDraftIssueTypeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueType: issueType_example,
    // number
    id: 56,
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies SetDraftIssueTypeRequest;

  try {
    const data = await api.setDraftIssueType(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueType** | `string` |  | [Defaults to `undefined`] |
| **id** | `number` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## setIssueNavigatorDefaultColumns

> { [key: string]: any; } setIssueNavigatorDefaultColumns()



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { SetIssueNavigatorDefaultColumnsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  try {
    const data = await api.setIssueNavigatorDefaultColumns();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/x-www-form-urlencoded`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **500** | Response 500 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## setIssueType

> { [key: string]: any; } setIssueType(issueType, id, requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { SetIssueTypeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueType: issueType_example,
    // number
    id: 56,
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies SetIssueTypeRequest;

  try {
    const data = await api.setIssueType(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueType** | `string` |  | [Defaults to `undefined`] |
| **id** | `number` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## setPinComment

> { [key: string]: any; } setPinComment(issueIdOrKey, id, requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { SetPinCommentRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueIdOrKey: issueIdOrKey_example,
    // string
    id: id_example,
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies SetPinCommentRequest;

  try {
    const data = await api.setPinComment(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueIdOrKey** | `string` |  | [Defaults to `undefined`] |
| **id** | `string` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## setPreference

> { [key: string]: any; } setPreference(requestBody, key)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { SetPreferenceRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // { [key: string]: any; }
    requestBody: Object,
    // string (optional)
    key: key_example,
  } satisfies SetPreferenceRequest;

  try {
    const data = await api.setPreference(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **requestBody** | `{ [key: string]: any; }` |  | |
| **key** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## setProjectAssociationsForScheme

> { [key: string]: any; } setProjectAssociationsForScheme(schemeId, requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { SetProjectAssociationsForSchemeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    schemeId: schemeId_example,
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies SetProjectAssociationsForSchemeRequest;

  try {
    const data = await api.setProjectAssociationsForScheme(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **schemeId** | `string` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **201** | Response 201 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## setProperty

> { [key: string]: any; } setProperty(issueTypeId, propertyKey, issueTypeId2)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { SetPropertyRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueTypeId: issueTypeId_example,
    // string
    propertyKey: propertyKey_example,
    // string
    issueTypeId2: issueTypeId_example,
  } satisfies SetPropertyRequest;

  try {
    const data = await api.setProperty(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueTypeId** | `string` |  | [Defaults to `undefined`] |
| **propertyKey** | `string` |  | [Defaults to `undefined`] |
| **issueTypeId2** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **201** | Response 201 |  -  |
| **400** | Response 400 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## setPropertyViaRestfulTable

> { [key: string]: any; } setPropertyViaRestfulTable(id, body)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { SetPropertyViaRestfulTableRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    id: id_example,
    // string
    body: body_example,
  } satisfies SetPropertyViaRestfulTableRequest;

  try {
    const data = await api.setPropertyViaRestfulTable(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |
| **body** | `string` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## setProperty_0

> { [key: string]: any; } setProperty_0(itemId, dashboardId, propertyKey, itemId2, dashboardId2)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { SetProperty0Request } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    itemId: itemId_example,
    // string
    dashboardId: dashboardId_example,
    // string
    propertyKey: propertyKey_example,
    // string
    itemId2: itemId_example,
    // string
    dashboardId2: dashboardId_example,
  } satisfies SetProperty0Request;

  try {
    const data = await api.setProperty_0(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **itemId** | `string` |  | [Defaults to `undefined`] |
| **dashboardId** | `string` |  | [Defaults to `undefined`] |
| **propertyKey** | `string` |  | [Defaults to `undefined`] |
| **itemId2** | `string` |  | [Defaults to `undefined`] |
| **dashboardId2** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **201** | Response 201 |  -  |
| **400** | Response 400 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## setProperty_1

> { [key: string]: any; } setProperty_1(commentId, propertyKey, commentId2)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { SetProperty1Request } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    commentId: commentId_example,
    // string
    propertyKey: propertyKey_example,
    // string
    commentId2: commentId_example,
  } satisfies SetProperty1Request;

  try {
    const data = await api.setProperty_1(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **commentId** | `string` |  | [Defaults to `undefined`] |
| **propertyKey** | `string` |  | [Defaults to `undefined`] |
| **commentId2** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **201** | Response 201 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## setProperty_2

> { [key: string]: any; } setProperty_2(projectIdOrKey, propertyKey, projectIdOrKey2)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { SetProperty2Request } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    projectIdOrKey: projectIdOrKey_example,
    // string
    propertyKey: propertyKey_example,
    // string
    projectIdOrKey2: projectIdOrKey_example,
  } satisfies SetProperty2Request;

  try {
    const data = await api.setProperty_2(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **projectIdOrKey** | `string` |  | [Defaults to `undefined`] |
| **propertyKey** | `string` |  | [Defaults to `undefined`] |
| **projectIdOrKey2** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **201** | Response 201 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## setProperty_3

> { [key: string]: any; } setProperty_3(propertyKey, userKey, username)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { SetProperty3Request } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    propertyKey: propertyKey_example,
    // string (optional)
    userKey: userKey_example,
    // string (optional)
    username: username_example,
  } satisfies SetProperty3Request;

  try {
    const data = await api.setProperty_3(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **propertyKey** | `string` |  | [Defaults to `undefined`] |
| **userKey** | `string` |  | [Optional] [Defaults to `undefined`] |
| **username** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **201** | Response 201 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## setProperty_4

> { [key: string]: any; } setProperty_4(issueIdOrKey, propertyKey, issueIdOrKey2)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { SetProperty4Request } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueIdOrKey: issueIdOrKey_example,
    // string
    propertyKey: propertyKey_example,
    // string
    issueIdOrKey2: issueIdOrKey_example,
  } satisfies SetProperty4Request;

  try {
    const data = await api.setProperty_4(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueIdOrKey** | `string` |  | [Defaults to `undefined`] |
| **propertyKey** | `string` |  | [Defaults to `undefined`] |
| **issueIdOrKey2** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **201** | Response 201 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## setReadyToUpgrade

> string setReadyToUpgrade()



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { SetReadyToUpgradeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  try {
    const data = await api.setReadyToUpgrade();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**string**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `*/*`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## setSchemeAttribute

> { [key: string]: any; } setSchemeAttribute(permissionSchemeId, key, body)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { SetSchemeAttributeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    permissionSchemeId: 56,
    // string
    key: key_example,
    // string
    body: body_example,
  } satisfies SetSchemeAttributeRequest;

  try {
    const data = await api.setSchemeAttribute(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **permissionSchemeId** | `number` |  | [Defaults to `undefined`] |
| **key** | `string` |  | [Defaults to `undefined`] |
| **body** | `string` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `text/plain`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **500** | Response 500 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## setTerminologyEntries

> setTerminologyEntries(requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { SetTerminologyEntriesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies SetTerminologyEntriesRequest;

  try {
    const data = await api.setTerminologyEntries(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

`void` (Empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **400** | Response 400 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## start

> { [key: string]: any; } start()



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { StartRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  try {
    const data = await api.start();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## stop

> { [key: string]: any; } stop()



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { StopRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  try {
    const data = await api.stop();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## storeTemporaryAvatar

> { [key: string]: any; } storeTemporaryAvatar(type, filename, size)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { StoreTemporaryAvatarRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    type: type_example,
    // string (optional)
    filename: filename_example,
    // number (optional)
    size: 56,
  } satisfies StoreTemporaryAvatarRequest;

  try {
    const data = await api.storeTemporaryAvatar(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **type** | `string` |  | [Defaults to `undefined`] |
| **filename** | `string` |  | [Optional] [Defaults to `undefined`] |
| **size** | `number` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Response 201 |  -  |
| **400** | Response 400 |  -  |
| **403** | Response 403 |  -  |
| **500** | Response 500 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## storeTemporaryAvatarUsingMultiPart

> string storeTemporaryAvatarUsingMultiPart(projectIdOrKey)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { StoreTemporaryAvatarUsingMultiPartRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    projectIdOrKey: projectIdOrKey_example,
  } satisfies StoreTemporaryAvatarUsingMultiPartRequest;

  try {
    const data = await api.storeTemporaryAvatarUsingMultiPart(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **projectIdOrKey** | `string` |  | [Defaults to `undefined`] |

### Return type

**string**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `text/html`, `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Response 201 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## storeTemporaryAvatarUsingMultiPart_0

> string storeTemporaryAvatarUsingMultiPart_0(id)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { StoreTemporaryAvatarUsingMultiPart0Request } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    id: id_example,
  } satisfies StoreTemporaryAvatarUsingMultiPart0Request;

  try {
    const data = await api.storeTemporaryAvatarUsingMultiPart_0(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |

### Return type

**string**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `text/html`, `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Response 201 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## storeTemporaryAvatarUsingMultiPart_1

> string storeTemporaryAvatarUsingMultiPart_1(username)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { StoreTemporaryAvatarUsingMultiPart1Request } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string (optional)
    username: username_example,
  } satisfies StoreTemporaryAvatarUsingMultiPart1Request;

  try {
    const data = await api.storeTemporaryAvatarUsingMultiPart_1(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **username** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**string**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `text/html`, `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Response 201 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |
| **500** | Response 500 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## storeTemporaryAvatarUsingMultiPart_2

> string storeTemporaryAvatarUsingMultiPart_2(type, owningObjectId)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { StoreTemporaryAvatarUsingMultiPart2Request } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    type: type_example,
    // string
    owningObjectId: owningObjectId_example,
  } satisfies StoreTemporaryAvatarUsingMultiPart2Request;

  try {
    const data = await api.storeTemporaryAvatarUsingMultiPart_2(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **type** | `string` |  | [Defaults to `undefined`] |
| **owningObjectId** | `string` |  | [Defaults to `undefined`] |

### Return type

**string**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `text/html`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## unassignPriorityScheme

> { [key: string]: any; } unassignPriorityScheme(projectKeyOrId, projectKeyOrId2, schemeId)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { UnassignPrioritySchemeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    projectKeyOrId: projectKeyOrId_example,
    // string
    projectKeyOrId2: projectKeyOrId_example,
    // number
    schemeId: 56,
  } satisfies UnassignPrioritySchemeRequest;

  try {
    const data = await api.unassignPriorityScheme(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **projectKeyOrId** | `string` |  | [Defaults to `undefined`] |
| **projectKeyOrId2** | `string` |  | [Defaults to `undefined`] |
| **schemeId** | `number` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## unlockAnonymization

> { [key: string]: any; } unlockAnonymization()



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { UnlockAnonymizationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  try {
    const data = await api.unlockAnonymization();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **400** | Response 400 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |
| **409** | Response 409 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## update

> { [key: string]: any; } update(id, requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { UpdateRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    id: 56,
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies UpdateRequest;

  try {
    const data = await api.update(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `number` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## updateComment

> { [key: string]: any; } updateComment(issueIdOrKey, id, requestBody, expand)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { UpdateCommentRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueIdOrKey: issueIdOrKey_example,
    // string
    id: id_example,
    // { [key: string]: any; }
    requestBody: Object,
    // string (optional)
    expand: expand_example,
  } satisfies UpdateCommentRequest;

  try {
    const data = await api.updateComment(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueIdOrKey** | `string` |  | [Defaults to `undefined`] |
| **id** | `string` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |
| **expand** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## updateComponent

> { [key: string]: any; } updateComponent(id, requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { UpdateComponentRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    id: id_example,
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies UpdateComponentRequest;

  try {
    const data = await api.updateComponent(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## updateDefault

> { [key: string]: any; } updateDefault(id, requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { UpdateDefaultRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    id: 56,
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies UpdateDefaultRequest;

  try {
    const data = await api.updateDefault(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `number` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## updateDraft

> { [key: string]: any; } updateDraft(id, requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { UpdateDraftRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    id: 56,
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies UpdateDraftRequest;

  try {
    const data = await api.updateDraft(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `number` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## updateDraftDefault

> { [key: string]: any; } updateDraftDefault(id, requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { UpdateDraftDefaultRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    id: 56,
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies UpdateDraftDefaultRequest;

  try {
    const data = await api.updateDraftDefault(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `number` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## updateDraftWorkflowMapping

> { [key: string]: any; } updateDraftWorkflowMapping(id, requestBody, workflowName)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { UpdateDraftWorkflowMappingRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    id: 56,
    // { [key: string]: any; }
    requestBody: Object,
    // string (optional)
    workflowName: workflowName_example,
  } satisfies UpdateDraftWorkflowMappingRequest;

  try {
    const data = await api.updateDraftWorkflowMapping(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `number` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |
| **workflowName** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## updateIssueLinkType

> { [key: string]: any; } updateIssueLinkType(issueLinkTypeId, requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { UpdateIssueLinkTypeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueLinkTypeId: issueLinkTypeId_example,
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies UpdateIssueLinkTypeRequest;

  try {
    const data = await api.updateIssueLinkType(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueLinkTypeId** | `string` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## updateIssueType

> { [key: string]: any; } updateIssueType(id, requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { UpdateIssueTypeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    id: id_example,
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies UpdateIssueTypeRequest;

  try {
    const data = await api.updateIssueType(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |
| **409** | Response 409 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## updateIssueTypeScheme

> { [key: string]: any; } updateIssueTypeScheme(schemeId, requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { UpdateIssueTypeSchemeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    schemeId: schemeId_example,
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies UpdateIssueTypeSchemeRequest;

  try {
    const data = await api.updateIssueTypeScheme(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **schemeId** | `string` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## updatePermissionScheme

> { [key: string]: any; } updatePermissionScheme(schemeId, requestBody, expand)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { UpdatePermissionSchemeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    schemeId: 56,
    // { [key: string]: any; }
    requestBody: Object,
    // string (optional)
    expand: expand_example,
  } satisfies UpdatePermissionSchemeRequest;

  try {
    const data = await api.updatePermissionScheme(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **schemeId** | `number` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |
| **expand** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Response 201 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## updatePriorityScheme

> { [key: string]: any; } updatePriorityScheme(schemeId, requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { UpdatePrioritySchemeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    schemeId: 56,
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies UpdatePrioritySchemeRequest;

  try {
    const data = await api.updatePriorityScheme(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **schemeId** | `number` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## updateProject

> { [key: string]: any; } updateProject(projectIdOrKey, requestBody, expand)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { UpdateProjectRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    projectIdOrKey: projectIdOrKey_example,
    // { [key: string]: any; }
    requestBody: Object,
    // string (optional)
    expand: expand_example,
  } satisfies UpdateProjectRequest;

  try {
    const data = await api.updateProject(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **projectIdOrKey** | `string` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |
| **expand** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Response 201 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## updateProjectAvatar

> { [key: string]: any; } updateProjectAvatar(projectIdOrKey, requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { UpdateProjectAvatarRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    projectIdOrKey: projectIdOrKey_example,
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies UpdateProjectAvatarRequest;

  try {
    const data = await api.updateProjectAvatar(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **projectIdOrKey** | `string` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## updateProjectCategory

> { [key: string]: any; } updateProjectCategory(id, requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { UpdateProjectCategoryRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    id: 56,
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies UpdateProjectCategoryRequest;

  try {
    const data = await api.updateProjectCategory(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `number` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **201** | Response 201 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## updateProjectType

> { [key: string]: any; } updateProjectType(projectIdOrKey, newProjectTypeKey)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { UpdateProjectTypeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    projectIdOrKey: projectIdOrKey_example,
    // string
    newProjectTypeKey: newProjectTypeKey_example,
  } satisfies UpdateProjectTypeRequest;

  try {
    const data = await api.updateProjectType(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **projectIdOrKey** | `string` |  | [Defaults to `undefined`] |
| **newProjectTypeKey** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## updateProperty

> { [key: string]: any; } updateProperty(id, requestBody, key, workflowName, workflowMode)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { UpdatePropertyRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    id: 56,
    // { [key: string]: any; }
    requestBody: Object,
    // string (optional)
    key: key_example,
    // string (optional)
    workflowName: workflowName_example,
    // string (optional)
    workflowMode: workflowMode_example,
  } satisfies UpdatePropertyRequest;

  try {
    const data = await api.updateProperty(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `number` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |
| **key** | `string` |  | [Optional] [Defaults to `undefined`] |
| **workflowName** | `string` |  | [Optional] [Defaults to `undefined`] |
| **workflowMode** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **304** | Response 304 |  -  |
| **400** | Response 400 |  -  |
| **403** | Response 403 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## updateRemoteIssueLink

> { [key: string]: any; } updateRemoteIssueLink(linkId, issueIdOrKey, requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { UpdateRemoteIssueLinkRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    linkId: linkId_example,
    // string
    issueIdOrKey: issueIdOrKey_example,
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies UpdateRemoteIssueLinkRequest;

  try {
    const data = await api.updateRemoteIssueLink(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **linkId** | `string` |  | [Defaults to `undefined`] |
| **issueIdOrKey** | `string` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## updateShowWhenEmptyIndicator

> { [key: string]: any; } updateShowWhenEmptyIndicator(screenId, tabId, newValue, id)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { UpdateShowWhenEmptyIndicatorRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    screenId: 56,
    // number
    tabId: 56,
    // boolean
    newValue: true,
    // string
    id: id_example,
  } satisfies UpdateShowWhenEmptyIndicatorRequest;

  try {
    const data = await api.updateShowWhenEmptyIndicator(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **screenId** | `number` |  | [Defaults to `undefined`] |
| **tabId** | `number` |  | [Defaults to `undefined`] |
| **newValue** | `boolean` |  | [Defaults to `undefined`] |
| **id** | `string` |  | [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Response 204 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## updateUser

> { [key: string]: any; } updateUser(requestBody, username, key)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { UpdateUserRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // { [key: string]: any; }
    requestBody: Object,
    // string (optional)
    username: username_example,
    // string (optional)
    key: key_example,
  } satisfies UpdateUserRequest;

  try {
    const data = await api.updateUser(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **requestBody** | `{ [key: string]: any; }` |  | |
| **username** | `string` |  | [Optional] [Defaults to `undefined`] |
| **key** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## updateUserAvatar

> { [key: string]: any; } updateUserAvatar(requestBody, username)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { UpdateUserAvatarRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // { [key: string]: any; }
    requestBody: Object,
    // string (optional)
    username: username_example,
  } satisfies UpdateUserAvatarRequest;

  try {
    const data = await api.updateUserAvatar(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **requestBody** | `{ [key: string]: any; }` |  | |
| **username** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## updateUser_0

> { [key: string]: any; } updateUser_0(requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { UpdateUser0Request } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies UpdateUser0Request;

  try {
    const data = await api.updateUser_0(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **401** | Response 401 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## updateVersion

> { [key: string]: any; } updateVersion(id, requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { UpdateVersionRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    id: id_example,
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies UpdateVersionRequest;

  try {
    const data = await api.updateVersion(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **403** | Response 403 |  -  |
| **404** | Response 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## updateWorkflowMapping

> { [key: string]: any; } updateWorkflowMapping(id, requestBody, workflowName)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { UpdateWorkflowMappingRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // number
    id: 56,
    // { [key: string]: any; }
    requestBody: Object,
    // string (optional)
    workflowName: workflowName_example,
  } satisfies UpdateWorkflowMappingRequest;

  try {
    const data = await api.updateWorkflowMapping(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `number` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |
| **workflowName** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **401** | Response 401 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## updateWorklog

> { [key: string]: any; } updateWorklog(issueIdOrKey, id, requestBody, adjustEstimate, newEstimate)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { UpdateWorklogRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    issueIdOrKey: issueIdOrKey_example,
    // string
    id: id_example,
    // { [key: string]: any; }
    requestBody: Object,
    // string (optional)
    adjustEstimate: adjustEstimate_example,
    // string (optional)
    newEstimate: newEstimate_example,
  } satisfies UpdateWorklogRequest;

  try {
    const data = await api.updateWorklog(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **issueIdOrKey** | `string` |  | [Defaults to `undefined`] |
| **id** | `string` |  | [Defaults to `undefined`] |
| **requestBody** | `{ [key: string]: any; }` |  | |
| **adjustEstimate** | `string` |  | [Optional] [Defaults to `undefined`] |
| **newEstimate** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **403** | Response 403 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## uploadEmailTemplates

> { [key: string]: any; } uploadEmailTemplates(body)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { UploadEmailTemplatesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string
    body: body_example,
  } satisfies UploadEmailTemplatesRequest;

  try {
    const data = await api.uploadEmailTemplates(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **body** | `string` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/zip`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## validate

> { [key: string]: any; } validate(requestBody)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { ValidateRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // { [key: string]: any; }
    requestBody: Object,
  } satisfies ValidateRequest;

  try {
    const data = await api.validate(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **requestBody** | `{ [key: string]: any; }` |  | |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## validateUserAnonymization

> { [key: string]: any; } validateUserAnonymization(userKey, expand)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { ValidateUserAnonymizationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string (optional)
    userKey: userKey_example,
    // string (optional)
    expand: expand_example,
  } satisfies ValidateUserAnonymizationRequest;

  try {
    const data = await api.validateUserAnonymization(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **userKey** | `string` |  | [Optional] [Defaults to `undefined`] |
| **expand** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **403** | Response 403 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## validateUserAnonymizationRerun

> { [key: string]: any; } validateUserAnonymizationRerun(userKey, oldUserKey, oldUserName, expand)



### Example

```ts
import {
  Configuration,
  ApiApi,
} from '';
import type { ValidateUserAnonymizationRerunRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ApiApi();

  const body = {
    // string (optional)
    userKey: userKey_example,
    // string (optional)
    oldUserKey: oldUserKey_example,
    // string (optional)
    oldUserName: oldUserName_example,
    // string (optional)
    expand: expand_example,
  } satisfies ValidateUserAnonymizationRerunRequest;

  try {
    const data = await api.validateUserAnonymizationRerun(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **userKey** | `string` |  | [Optional] [Defaults to `undefined`] |
| **oldUserKey** | `string` |  | [Optional] [Defaults to `undefined`] |
| **oldUserName** | `string` |  | [Optional] [Defaults to `undefined`] |
| **expand** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Response 200 |  -  |
| **400** | Response 400 |  -  |
| **403** | Response 403 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

