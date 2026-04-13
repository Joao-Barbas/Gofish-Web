'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">angular documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                                <li class="link">
                                    <a href="overview.html" data-type="chapter-link">
                                        <span class="icon ion-ios-keypad"></span>Overview
                                    </a>
                                </li>

                            <li class="link">
                                <a href="index.html" data-type="chapter-link">
                                    <span class="icon ion-ios-paper"></span>
                                        README
                                </a>
                            </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>

                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-bs-toggle="collapse" ${ isNormalMode ?
                                'data-bs-target="#modules-links"' : 'data-bs-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/TemplatePlaygroundModule.html" data-type="entity-link" >TemplatePlaygroundModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-TemplatePlaygroundModule-a48e698b66bad8be9ff3b78b5db8e15ee6bb54bd2575fdb1bb61a34e76437cc54b2e161854c3d6c97b4c751d05ff3a43b70b87ceffd46d3c5bf53f6f161e3044"' : 'data-bs-target="#xs-components-links-module-TemplatePlaygroundModule-a48e698b66bad8be9ff3b78b5db8e15ee6bb54bd2575fdb1bb61a34e76437cc54b2e161854c3d6c97b4c751d05ff3a43b70b87ceffd46d3c5bf53f6f161e3044"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-TemplatePlaygroundModule-a48e698b66bad8be9ff3b78b5db8e15ee6bb54bd2575fdb1bb61a34e76437cc54b2e161854c3d6c97b4c751d05ff3a43b70b87ceffd46d3c5bf53f6f161e3044"' :
                                            'id="xs-components-links-module-TemplatePlaygroundModule-a48e698b66bad8be9ff3b78b5db8e15ee6bb54bd2575fdb1bb61a34e76437cc54b2e161854c3d6c97b4c751d05ff3a43b70b87ceffd46d3c5bf53f6f161e3044"' }>
                                            <li class="link">
                                                <a href="components/TemplatePlaygroundComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TemplatePlaygroundComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-TemplatePlaygroundModule-a48e698b66bad8be9ff3b78b5db8e15ee6bb54bd2575fdb1bb61a34e76437cc54b2e161854c3d6c97b4c751d05ff3a43b70b87ceffd46d3c5bf53f6f161e3044"' : 'data-bs-target="#xs-injectables-links-module-TemplatePlaygroundModule-a48e698b66bad8be9ff3b78b5db8e15ee6bb54bd2575fdb1bb61a34e76437cc54b2e161854c3d6c97b4c751d05ff3a43b70b87ceffd46d3c5bf53f6f161e3044"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-TemplatePlaygroundModule-a48e698b66bad8be9ff3b78b5db8e15ee6bb54bd2575fdb1bb61a34e76437cc54b2e161854c3d6c97b4c751d05ff3a43b70b87ceffd46d3c5bf53f6f161e3044"' :
                                        'id="xs-injectables-links-module-TemplatePlaygroundModule-a48e698b66bad8be9ff3b78b5db8e15ee6bb54bd2575fdb1bb61a34e76437cc54b2e161854c3d6c97b4c751d05ff3a43b70b87ceffd46d3c5bf53f6f161e3044"' }>
                                        <li class="link">
                                            <a href="injectables/HbsRenderService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HbsRenderService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/TemplateEditorService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TemplateEditorService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ZipExportService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ZipExportService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#components-links"' :
                            'data-bs-target="#xs-components-links"' }>
                            <span class="icon ion-md-cog"></span>
                            <span>Components</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="components-links"' : 'id="xs-components-links"' }>
                            <li class="link">
                                <a href="components/AboutComponent.html" data-type="entity-link" >AboutComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AdminPopoverComponent.html" data-type="entity-link" >AdminPopoverComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AppComponent.html" data-type="entity-link" >AppComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AsyncButtonComponent.html" data-type="entity-link" >AsyncButtonComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AsyncButtonComponent-1.html" data-type="entity-link" >AsyncButtonComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AsyncButtonComponent-2.html" data-type="entity-link" >AsyncButtonComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AuthCallbackComponent.html" data-type="entity-link" >AuthCallbackComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CatchPinModalComponent.html" data-type="entity-link" >CatchPinModalComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ChangeBirthdateModalComponent.html" data-type="entity-link" >ChangeBirthdateModalComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ChangeDisplaynameModalComponent.html" data-type="entity-link" >ChangeDisplaynameModalComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ChangeEmailModalComponent.html" data-type="entity-link" >ChangeEmailModalComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ChangeFirstnameModalComponent.html" data-type="entity-link" >ChangeFirstnameModalComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ChangeLastnameModalComponent.html" data-type="entity-link" >ChangeLastnameModalComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ChangePhoneModalComponent.html" data-type="entity-link" >ChangePhoneModalComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ChangeUsernameModalComponent.html" data-type="entity-link" >ChangeUsernameModalComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ChoosePinPopupComponent.html" data-type="entity-link" >ChoosePinPopupComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ClusterDetailsComponent.html" data-type="entity-link" >ClusterDetailsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ConfirmDeletionModalComponent.html" data-type="entity-link" >ConfirmDeletionModalComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DeleteCommentComponent.html" data-type="entity-link" >DeleteCommentComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DeleteGroupComponent.html" data-type="entity-link" >DeleteGroupComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DeletePinComponent.html" data-type="entity-link" >DeletePinComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DeletePostComponent.html" data-type="entity-link" >DeletePostComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DiscoverComponent.html" data-type="entity-link" >DiscoverComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/EnumComponent.html" data-type="entity-link" >EnumComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ExitGroupComponent.html" data-type="entity-link" >ExitGroupComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/FooterComponent.html" data-type="entity-link" >FooterComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ForumComponent.html" data-type="entity-link" >ForumComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ForumPostComponent.html" data-type="entity-link" >ForumPostComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/FriendsComponent.html" data-type="entity-link" >FriendsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/FriendshipListCardComponent.html" data-type="entity-link" >FriendshipListCardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/FriendsListComponent.html" data-type="entity-link" >FriendsListComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/FromFriendsComponent.html" data-type="entity-link" >FromFriendsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GeneralComponent.html" data-type="entity-link" >GeneralComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GfCardCommentPreviewComponent.html" data-type="entity-link" >GfCardCommentPreviewComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GfCardPinPreviewComponent.html" data-type="entity-link" >GfCardPinPreviewComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GfCardQuickAccessComponent.html" data-type="entity-link" >GfCardQuickAccessComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GfCardQuickViewComponent.html" data-type="entity-link" >GfCardQuickViewComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GroupCreateComponent.html" data-type="entity-link" >GroupCreateComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GroupInviteComponent.html" data-type="entity-link" >GroupInviteComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GroupInvitesCardComponent.html" data-type="entity-link" >GroupInvitesCardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GroupInvitesListComponent.html" data-type="entity-link" >GroupInvitesListComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GroupListCardComponent.html" data-type="entity-link" >GroupListCardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GroupMemberSettingsPopoverComponent.html" data-type="entity-link" >GroupMemberSettingsPopoverComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GroupPopoverComponent.html" data-type="entity-link" >GroupPopoverComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GroupPostsPlaceholderComponent.html" data-type="entity-link" >GroupPostsPlaceholderComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GroupsComponent.html" data-type="entity-link" >GroupsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GroupsComponent-1.html" data-type="entity-link" >GroupsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GroupsListCardComponent.html" data-type="entity-link" >GroupsListCardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GroupsListComponent.html" data-type="entity-link" >GroupsListComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GroupsListComponent-1.html" data-type="entity-link" >GroupsListComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/HeaderActionsComponent.html" data-type="entity-link" >HeaderActionsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/HeaderComponent.html" data-type="entity-link" >HeaderComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/HomeComponent.html" data-type="entity-link" >HomeComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/InfoPinModalComponent.html" data-type="entity-link" >InfoPinModalComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/InviteToGroupsModalComponent.html" data-type="entity-link" >InviteToGroupsModalComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LeaderboardComponent.html" data-type="entity-link" >LeaderboardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LoadingErrorModalComponent.html" data-type="entity-link" >LoadingErrorModalComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LoadingSpinnerComponent.html" data-type="entity-link" >LoadingSpinnerComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MapComponent.html" data-type="entity-link" >MapComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MembersGroupComponent.html" data-type="entity-link" >MembersGroupComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MyGroupsComponent.html" data-type="entity-link" >MyGroupsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/NavPopoverComponent.html" data-type="entity-link" >NavPopoverComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/OverviewComponent.html" data-type="entity-link" >OverviewComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PersonalDataComponent.html" data-type="entity-link" >PersonalDataComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PinDetailPanelComponent.html" data-type="entity-link" >PinDetailPanelComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PinsAvgPublishedChart.html" data-type="entity-link" >PinsAvgPublishedChart</a>
                            </li>
                            <li class="link">
                                <a href="components/PinsComponent.html" data-type="entity-link" >PinsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PinsPerWeekComponent.html" data-type="entity-link" >PinsPerWeekComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PostCommentsComponent.html" data-type="entity-link" >PostCommentsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PostIdPlaceholderComponent.html" data-type="entity-link" >PostIdPlaceholderComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PrivacyPolicyComponent.html" data-type="entity-link" >PrivacyPolicyComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ProfileActionsPopoverComponent.html" data-type="entity-link" >ProfileActionsPopoverComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ProfileCatchPinCardComponent.html" data-type="entity-link" >ProfileCatchPinCardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ProfileShellComponent.html" data-type="entity-link" >ProfileShellComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ProfileShowMoreModalComponent.html" data-type="entity-link" >ProfileShowMoreModalComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ReportCommentComponent.html" data-type="entity-link" >ReportCommentComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ReportedCommentPageComponent.html" data-type="entity-link" >ReportedCommentPageComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ReportedCommentsComponent.html" data-type="entity-link" >ReportedCommentsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ReportedPinPageComponent.html" data-type="entity-link" >ReportedPinPageComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ReportedPinsComponent.html" data-type="entity-link" >ReportedPinsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ReportPinComponent.html" data-type="entity-link" >ReportPinComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/RequestsListComponent.html" data-type="entity-link" >RequestsListComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ResetPasswordComponent.html" data-type="entity-link" >ResetPasswordComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SearchComponent.html" data-type="entity-link" >SearchComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SecurityComponent.html" data-type="entity-link" >SecurityComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SettingsComponent.html" data-type="entity-link" >SettingsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SetupTotpComponent.html" data-type="entity-link" >SetupTotpComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SigninComponent.html" data-type="entity-link" >SigninComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SigninVerifyComponent.html" data-type="entity-link" >SigninVerifyComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SignupComponent.html" data-type="entity-link" >SignupComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SmallFriendshipCarouselCardComponent.html" data-type="entity-link" >SmallFriendshipCarouselCardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SmallGroupCarouselCardComponent.html" data-type="entity-link" >SmallGroupCarouselCardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/StatisticsComponent.html" data-type="entity-link" >StatisticsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/StatsHomeComponent.html" data-type="entity-link" >StatsHomeComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/StatsReportsComponent.html" data-type="entity-link" >StatsReportsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TermsOfServiceComponent.html" data-type="entity-link" >TermsOfServiceComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TotpValidationModalComponent.html" data-type="entity-link" >TotpValidationModalComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/UserCardComponent.html" data-type="entity-link" >UserCardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/UserHelpBoxComponent.html" data-type="entity-link" >UserHelpBoxComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/UserPopoverComponent.html" data-type="entity-link" >UserPopoverComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/UserRankIconComponent.html" data-type="entity-link" >UserRankIconComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/UserSatisfactionIndexComponent.html" data-type="entity-link" >UserSatisfactionIndexComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/UsersChartComponent.html" data-type="entity-link" >UsersChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/UsersListCardComponent.html" data-type="entity-link" >UsersListCardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/UsersListComponent.html" data-type="entity-link" >UsersListComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/UserTitleComponent.html" data-type="entity-link" >UserTitleComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/VerifyEmailModalComponent.html" data-type="entity-link" >VerifyEmailModalComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/VerifyTwofaContainerComponent.html" data-type="entity-link" >VerifyTwofaContainerComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/WarnPinModalComponent.html" data-type="entity-link" >WarnPinModalComponent</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#directives-links"' :
                                'data-bs-target="#xs-directives-links"' }>
                                <span class="icon ion-md-code-working"></span>
                                <span>Directives</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="directives-links"' : 'id="xs-directives-links"' }>
                                <li class="link">
                                    <a href="directives/ClickOutsideDirective.html" data-type="entity-link" >ClickOutsideDirective</a>
                                </li>
                                <li class="link">
                                    <a href="directives/LettersOnlyDirective.html" data-type="entity-link" >LettersOnlyDirective</a>
                                </li>
                                <li class="link">
                                    <a href="directives/MouseFollowDirective.html" data-type="entity-link" >MouseFollowDirective</a>
                                </li>
                                <li class="link">
                                    <a href="directives/NumbersOnlyDirective.html" data-type="entity-link" >NumbersOnlyDirective</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#classes-links"' :
                            'data-bs-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/BusyState.html" data-type="entity-link" >BusyState</a>
                            </li>
                            <li class="link">
                                <a href="classes/FormErrorMessages.html" data-type="entity-link" >FormErrorMessages</a>
                            </li>
                            <li class="link">
                                <a href="classes/GofishValidators.html" data-type="entity-link" >GofishValidators</a>
                            </li>
                            <li class="link">
                                <a href="classes/LoadingState.html" data-type="entity-link" >LoadingState</a>
                            </li>
                            <li class="link">
                                <a href="classes/ModalController.html" data-type="entity-link" >ModalController</a>
                            </li>
                            <li class="link">
                                <a href="classes/PopoverController.html" data-type="entity-link" >PopoverController</a>
                            </li>
                            <li class="link">
                                <a href="classes/PopupController.html" data-type="entity-link" class="deprecated-name">PopupController</a>
                            </li>
                            <li class="link">
                                <a href="classes/ReactiveFormsController.html" data-type="entity-link" >ReactiveFormsController</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AuthApi.html" data-type="entity-link" >AuthApi</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuthService.html" data-type="entity-link" >AuthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AvatarService.html" data-type="entity-link" >AvatarService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FirstKeyPipe.html" data-type="entity-link" >FirstKeyPipe</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/GeolocationService.html" data-type="entity-link" >GeolocationService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/GroupApi.html" data-type="entity-link" >GroupApi</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/GroupsService.html" data-type="entity-link" >GroupsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/HbsRenderService.html" data-type="entity-link" >HbsRenderService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MapInteractionsService.html" data-type="entity-link" >MapInteractionsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MapLayersService.html" data-type="entity-link" >MapLayersService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MarkerRegistryService.html" data-type="entity-link" >MarkerRegistryService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ModalService.html" data-type="entity-link" >ModalService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PinApi.html" data-type="entity-link" >PinApi</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PinHoverPreviewService.html" data-type="entity-link" >PinHoverPreviewService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PinService.html" data-type="entity-link" >PinService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PopoverService.html" data-type="entity-link" >PopoverService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PopupService.html" data-type="entity-link" class="deprecated-name">PopupService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PreviewMarkerService.html" data-type="entity-link" >PreviewMarkerService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ProfileContext.html" data-type="entity-link" >ProfileContext</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ReportService.html" data-type="entity-link" >ReportService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/StatsService.html" data-type="entity-link" >StatsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TemplateEditorService.html" data-type="entity-link" >TemplateEditorService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UrlService.html" data-type="entity-link" >UrlService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UserAccountApi.html" data-type="entity-link" >UserAccountApi</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UserAccountService.html" data-type="entity-link" >UserAccountService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UserApi.html" data-type="entity-link" >UserApi</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UserManagerService.html" data-type="entity-link" >UserManagerService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UserProfileApi.html" data-type="entity-link" >UserProfileApi</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UserSecurityApi.html" data-type="entity-link" >UserSecurityApi</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UserSecurityService.html" data-type="entity-link" >UserSecurityService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ZipExportService.html" data-type="entity-link" >ZipExportService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/AuthorDTO.html" data-type="entity-link" >AuthorDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ChangePasswordReqDTO.html" data-type="entity-link" >ChangePasswordReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ChangePasswordResDTO.html" data-type="entity-link" >ChangePasswordResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CommentAuthorDto.html" data-type="entity-link" >CommentAuthorDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CommentDto.html" data-type="entity-link" >CommentDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CompleteEmailChangeReqDTO.html" data-type="entity-link" >CompleteEmailChangeReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CompleteEmailChangeResDTO.html" data-type="entity-link" >CompleteEmailChangeResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CompoDocConfig.html" data-type="entity-link" >CompoDocConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CreateCatchPinReqDTO.html" data-type="entity-link" >CreateCatchPinReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CreateCatchPinReqDto.html" data-type="entity-link" >CreateCatchPinReqDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CreateCommentReportReqDTO.html" data-type="entity-link" >CreateCommentReportReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CreateCommentReportResDTO.html" data-type="entity-link" >CreateCommentReportResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CreateCommentReqDto.html" data-type="entity-link" >CreateCommentReqDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CreateCommentResDto.html" data-type="entity-link" >CreateCommentResDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CreateGroupReqDTO.html" data-type="entity-link" >CreateGroupReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CreateGroupResDTO.html" data-type="entity-link" >CreateGroupResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CreateInfoPinReqDTO.html" data-type="entity-link" >CreateInfoPinReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CreateInfoPinReqDto.html" data-type="entity-link" >CreateInfoPinReqDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CreatePinReportReqDTO.html" data-type="entity-link" >CreatePinReportReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CreatePinReportResDTO.html" data-type="entity-link" >CreatePinReportResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CreatePinResDTO.html" data-type="entity-link" >CreatePinResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CreatePinResDto.html" data-type="entity-link" >CreatePinResDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CreatePostCommentReqDTO.html" data-type="entity-link" >CreatePostCommentReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CreatePostCommentResDTO.html" data-type="entity-link" >CreatePostCommentResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CreateWarnPinReqDTO.html" data-type="entity-link" >CreateWarnPinReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CreateWarnPinReqDto.html" data-type="entity-link" >CreateWarnPinReqDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DeleteAccountReqDTO.html" data-type="entity-link" >DeleteAccountReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DeleteAccountResDTO.html" data-type="entity-link" >DeleteAccountResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DeleteReportsReqDTO.html" data-type="entity-link" >DeleteReportsReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DisableTotpReqDTO.html" data-type="entity-link" >DisableTotpReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DisableTotpResDTO.html" data-type="entity-link" >DisableTotpResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EnableTotpReqDTO.html" data-type="entity-link" >EnableTotpReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EnableTotpResDTO.html" data-type="entity-link" >EnableTotpResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EnumDTO.html" data-type="entity-link" >EnumDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ExternalSignInReqDTO.html" data-type="entity-link" >ExternalSignInReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ExternalSignInResDTO.html" data-type="entity-link" >ExternalSignInResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ForgotPasswordReqDTO.html" data-type="entity-link" >ForgotPasswordReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ForgotPasswordResDTO.html" data-type="entity-link" >ForgotPasswordResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FriendshipDTO.html" data-type="entity-link" >FriendshipDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FriendshipUserDTO.html" data-type="entity-link" >FriendshipUserDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GeoLocationDTO.html" data-type="entity-link" >GeoLocationDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetActiveUsersResDTO.html" data-type="entity-link" >GetActiveUsersResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetAveragePublishedPinsResDTO.html" data-type="entity-link" >GetAveragePublishedPinsResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetAverageVotesPerPinResDTO.html" data-type="entity-link" >GetAverageVotesPerPinResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetCommentsReportsByCommentReqDTO.html" data-type="entity-link" >GetCommentsReportsByCommentReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetCommentsReqDto.html" data-type="entity-link" >GetCommentsReqDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetCommentsResDto.html" data-type="entity-link" >GetCommentsResDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetDailyUserSatisfactionAverageDTO.html" data-type="entity-link" >GetDailyUserSatisfactionAverageDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetFeedReqDTO.html" data-type="entity-link" >GetFeedReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetFeedReqDto.html" data-type="entity-link" >GetFeedReqDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetFeedResDTO.html" data-type="entity-link" >GetFeedResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetFeedResDto.html" data-type="entity-link" >GetFeedResDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetFriendshipBetweenReqDTO.html" data-type="entity-link" >GetFriendshipBetweenReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetFriendshipsReqDTO.html" data-type="entity-link" >GetFriendshipsReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetFriendshipsResDTO.html" data-type="entity-link" >GetFriendshipsResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetGroupDTO.html" data-type="entity-link" >GetGroupDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetGroupInvitesReqDTO.html" data-type="entity-link" >GetGroupInvitesReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetGroupInvitesResDTO.html" data-type="entity-link" >GetGroupInvitesResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetGroupMemberDTO.html" data-type="entity-link" >GetGroupMemberDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetGroupMembersReqDTO.html" data-type="entity-link" >GetGroupMembersReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetGroupMembersResDTO.html" data-type="entity-link" >GetGroupMembersResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetGroupPinsReqDto.html" data-type="entity-link" >GetGroupPinsReqDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetGroupPinsResDto.html" data-type="entity-link" >GetGroupPinsResDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetGroupPostsReqDTO.html" data-type="entity-link" >GetGroupPostsReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetGroupPostsResDTO.html" data-type="entity-link" >GetGroupPostsResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetGroupReqDTO.html" data-type="entity-link" >GetGroupReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetGroupResDTO.html" data-type="entity-link" >GetGroupResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetInViewportReqDto.html" data-type="entity-link" >GetInViewportReqDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetInViewportResDto.html" data-type="entity-link" >GetInViewportResDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetInvitableGroupsReqDTO.html" data-type="entity-link" >GetInvitableGroupsReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetInvitableGroupsResDTO.html" data-type="entity-link" >GetInvitableGroupsResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetNewUsersTodayResDTO.html" data-type="entity-link" >GetNewUsersTodayResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetPinReportsByPinReqDTO.html" data-type="entity-link" >GetPinReportsByPinReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetPinsCreatedTodayResDTO.html" data-type="entity-link" >GetPinsCreatedTodayResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetPinsDataRequestDto.html" data-type="entity-link" >GetPinsDataRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetPinsIdDto.html" data-type="entity-link" >GetPinsIdDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetPinsReqDTO.html" data-type="entity-link" >GetPinsReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetPinsReqDto.html" data-type="entity-link" >GetPinsReqDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetPinsResDTO.html" data-type="entity-link" >GetPinsResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetPinsResDto.html" data-type="entity-link" >GetPinsResDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetPinsWeeklyStatsReqDTO.html" data-type="entity-link" >GetPinsWeeklyStatsReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetPinsWeeklyStatsResDTO.html" data-type="entity-link" >GetPinsWeeklyStatsResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetPinsWith15PositiveVotesResDTO.html" data-type="entity-link" >GetPinsWith15PositiveVotesResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetPostsAuthorDTO.html" data-type="entity-link" >GetPostsAuthorDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetPostsCommentDTO.html" data-type="entity-link" >GetPostsCommentDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetPostsCoordsDTO.html" data-type="entity-link" >GetPostsCoordsDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetPostsGroupDTO.html" data-type="entity-link" >GetPostsGroupDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetPostsPostDTO.html" data-type="entity-link" >GetPostsPostDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetPostsReqDTO.html" data-type="entity-link" >GetPostsReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetPostsResDTO.html" data-type="entity-link" >GetPostsResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetRegisteredUsersWeeklyStatsReqDTO.html" data-type="entity-link" >GetRegisteredUsersWeeklyStatsReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetRegisteredUsersWeeklyStatsResDTO.html" data-type="entity-link" >GetRegisteredUsersWeeklyStatsResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetReportReqDTO.html" data-type="entity-link" >GetReportReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetReportResDTO.html" data-type="entity-link" >GetReportResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetReportsResDTO.html" data-type="entity-link" >GetReportsResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetReportsWaitingReviewResDTO.html" data-type="entity-link" >GetReportsWaitingReviewResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetSuccessRateOfRequestsDTO.html" data-type="entity-link" >GetSuccessRateOfRequestsDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetTotalCatchPinsCreatedResDTO.html" data-type="entity-link" >GetTotalCatchPinsCreatedResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetTotalPinsCreatedResDTO.html" data-type="entity-link" >GetTotalPinsCreatedResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetTotalUsersResDTO.html" data-type="entity-link" >GetTotalUsersResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetTotalWarningPinsCreatedResDTO.html" data-type="entity-link" >GetTotalWarningPinsCreatedResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetTotpSetupReqDTO.html" data-type="entity-link" >GetTotpSetupReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetTotpSetupResDTO.html" data-type="entity-link" >GetTotpSetupResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetUserGroupReqDTO.html" data-type="entity-link" >GetUserGroupReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetUserGroupResDTO.html" data-type="entity-link" >GetUserGroupResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetUserGroupsResDTO.html" data-type="entity-link" >GetUserGroupsResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetUserProfileReqDTO.html" data-type="entity-link" >GetUserProfileReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetUserProfileResDTO.html" data-type="entity-link" class="deprecated-name">GetUserProfileResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetUserProfileSettingsReqDTO.html" data-type="entity-link" >GetUserProfileSettingsReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetUserProfileSettingsResDTO.html" data-type="entity-link" >GetUserProfileSettingsResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetUserReqDTO.html" data-type="entity-link" >GetUserReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetUserResDTO.html" data-type="entity-link" >GetUserResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetUserSettingsReqDTO.html" data-type="entity-link" >GetUserSettingsReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetUserSettingsResDTO.html" data-type="entity-link" >GetUserSettingsResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GroupDataRequestDTO.html" data-type="entity-link" >GroupDataRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GroupDTO.html" data-type="entity-link" >GroupDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GroupInviteDTO.html" data-type="entity-link" >GroupInviteDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GroupMemberDTO.html" data-type="entity-link" >GroupMemberDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GroupPostDTO.html" data-type="entity-link" >GroupPostDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GroupPostPinDTO.html" data-type="entity-link" >GroupPostPinDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/InitiateEmailChangeReqDTO.html" data-type="entity-link" >InitiateEmailChangeReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/InitiateEmailChangeResDTO.html" data-type="entity-link" >InitiateEmailChangeResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/InvitableGroup.html" data-type="entity-link" >InvitableGroup</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LeaderboardResDTO.html" data-type="entity-link" >LeaderboardResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LeaderboardUserDTO.html" data-type="entity-link" >LeaderboardUserDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PatchUserProfileReqDTO.html" data-type="entity-link" >PatchUserProfileReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PatchUserReqDTO.html" data-type="entity-link" >PatchUserReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PatchUserResDTO.html" data-type="entity-link" >PatchUserResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Pin.html" data-type="entity-link" >Pin</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PinAuthorDto.html" data-type="entity-link" >PinAuthorDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PinDataReqDTO.html" data-type="entity-link" >PinDataReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PinDataResDTO.html" data-type="entity-link" >PinDataResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PinDetailsDTO.html" data-type="entity-link" >PinDetailsDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PinDetailsDto.html" data-type="entity-link" >PinDetailsDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PinDto.html" data-type="entity-link" >PinDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PinGeolocationDto.html" data-type="entity-link" >PinGeolocationDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PinIdDTO.html" data-type="entity-link" >PinIdDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PinMonthStats.html" data-type="entity-link" >PinMonthStats</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PinMonthStats-1.html" data-type="entity-link" >PinMonthStats</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PinStatsDto.html" data-type="entity-link" >PinStatsDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PinUgcDto.html" data-type="entity-link" >PinUgcDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PinWeekStats.html" data-type="entity-link" >PinWeekStats</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PostDataRequestDTO.html" data-type="entity-link" >PostDataRequestDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PostDTO.html" data-type="entity-link" >PostDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PostIdDTO.html" data-type="entity-link" >PostIdDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProblemDetails.html" data-type="entity-link" >ProblemDetails</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PutUserProfileReqDTO.html" data-type="entity-link" >PutUserProfileReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PutUserReqDTO.html" data-type="entity-link" >PutUserReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PutUserResDTO.html" data-type="entity-link" >PutUserResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RequestFriendshipReqDTO.html" data-type="entity-link" >RequestFriendshipReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RequestFriendshipResDTO.html" data-type="entity-link" >RequestFriendshipResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ResetPasswordReqDTO.html" data-type="entity-link" >ResetPasswordReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ResetPasswordResDTO.html" data-type="entity-link" >ResetPasswordResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SearchGroupDTO.html" data-type="entity-link" >SearchGroupDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SearchGroupsReqDTO.html" data-type="entity-link" >SearchGroupsReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SearchGroupsResDTO.html" data-type="entity-link" >SearchGroupsResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SearchUserDTO.html" data-type="entity-link" >SearchUserDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SearchUsersReqDTO.html" data-type="entity-link" >SearchUsersReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SearchUsersResDTO.html" data-type="entity-link" >SearchUsersResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SecurityInfo.html" data-type="entity-link" >SecurityInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SecurityInfoReqDTO.html" data-type="entity-link" >SecurityInfoReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SecurityInfoResDTO.html" data-type="entity-link" >SecurityInfoResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SendGroupInviteReqDTO.html" data-type="entity-link" >SendGroupInviteReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SendGroupInviteResDTO.html" data-type="entity-link" >SendGroupInviteResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Session.html" data-type="entity-link" >Session</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SignInReqDTO.html" data-type="entity-link" >SignInReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SignInResDTO.html" data-type="entity-link" >SignInResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SignUpReqDTO.html" data-type="entity-link" >SignUpReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SignUpResDTO.html" data-type="entity-link" >SignUpResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SimpleModal.html" data-type="entity-link" >SimpleModal</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SimpleModal-1.html" data-type="entity-link" >SimpleModal</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SimplePopup.html" data-type="entity-link" class="deprecated-name">SimplePopup</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Template.html" data-type="entity-link" >Template</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TwoFactorSignInReqDTO.html" data-type="entity-link" >TwoFactorSignInReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TwoFactorSignInResDTO.html" data-type="entity-link" >TwoFactorSignInResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UrlQuery.html" data-type="entity-link" >UrlQuery</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserGroupDTO.html" data-type="entity-link" >UserGroupDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserProfileDTO.html" data-type="entity-link" >UserProfileDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserState.html" data-type="entity-link" >UserState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ValidateTwoFactorCodeReqDTO.html" data-type="entity-link" >ValidateTwoFactorCodeReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ValidateTwoFactorCodeResDTO.html" data-type="entity-link" >ValidateTwoFactorCodeResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ValidationProblemDetails.html" data-type="entity-link" >ValidationProblemDetails</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VerifyEmailReqDTO.html" data-type="entity-link" >VerifyEmailReqDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VerifyEmailResDTO.html" data-type="entity-link" >VerifyEmailResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ViewportPinDTO.html" data-type="entity-link" >ViewportPinDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ViewportPinsResDTO.html" data-type="entity-link" >ViewportPinsResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VotePostDTO.html" data-type="entity-link" >VotePostDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VotePostResDTO.html" data-type="entity-link" >VotePostResDTO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VoteReqDto.html" data-type="entity-link" >VoteReqDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VoteResDto.html" data-type="entity-link" >VoteResDto</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#pipes-links"' :
                                'data-bs-target="#xs-pipes-links"' }>
                                <span class="icon ion-md-add"></span>
                                <span>Pipes</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="pipes-links"' : 'id="xs-pipes-links"' }>
                                <li class="link">
                                    <a href="pipes/AbsPipe.html" data-type="entity-link" >AbsPipe</a>
                                </li>
                                <li class="link">
                                    <a href="pipes/FallbackPipe.html" data-type="entity-link" >FallbackPipe</a>
                                </li>
                                <li class="link">
                                    <a href="pipes/FirstKeyPipe.html" data-type="entity-link" >FirstKeyPipe</a>
                                </li>
                                <li class="link">
                                    <a href="pipes/RegexMatchesPipe.html" data-type="entity-link" >RegexMatchesPipe</a>
                                </li>
                                <li class="link">
                                    <a href="pipes/TimeAgoPipe.html" data-type="entity-link" >TimeAgoPipe</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/enumerations.html" data-type="entity-link">Enums</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
                        </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});