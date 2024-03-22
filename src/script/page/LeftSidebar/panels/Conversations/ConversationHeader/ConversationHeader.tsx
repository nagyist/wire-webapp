/*
 * Wire
 * Copyright (C) 2024 Wire Swiss GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 *
 */

import {amplify} from 'amplify';

import {Button, ButtonVariant} from '@wireapp/react-ui-kit';
import {WebAppEvents} from '@wireapp/webapp-events';

import {Icon} from 'Components/Icon';
import {t} from 'Util/LocalizerUtil';

import {button, header, label} from './ConversationHeader.styles';

import {User} from '../../../../../entity/User';
import {generatePermissionHelpers} from '../../../../../user/UserPermission';
import {SidebarTabs} from '../Conversations';

interface ConversationHeaderProps {
  currentTab: SidebarTabs;
  selfUser: User;
}

export const ConversationHeader = ({currentTab, selfUser}: ConversationHeaderProps) => {
  const {canCreateGroupConversation} = generatePermissionHelpers(selfUser.teamRole());

  const conversationsHeaderTitle: Partial<Record<SidebarTabs, string>> = {
    [SidebarTabs.RECENT]: t('conversationViewAllConversations'),
    [SidebarTabs.FAVORITES]: t('conversationLabelFavorites'),
    [SidebarTabs.GROUPS]: t('conversationLabelGroups'),
    [SidebarTabs.DIRECTS]: t('conversationLabelDirects'),
    [SidebarTabs.FOLDER]: t('folderViewTooltip'),
    [SidebarTabs.ARCHIVES]: t('conversationFooterArchive'),
    [SidebarTabs.CONNECT]: t('searchConnect'),
  };

  return (
    <div css={header}>
      <span css={label}>{conversationsHeaderTitle[currentTab]}</span>

      {canCreateGroupConversation() && (
        <Button
          variant={ButtonVariant.TERTIARY}
          onClick={() => amplify.publish(WebAppEvents.CONVERSATION.CREATE_GROUP, 'conversation_details')}
          data-uie-name="go-create-group"
          css={button}
        >
          <Icon.Plus />

          {t('conversationGroupCreate')}
        </Button>
      )}
    </div>
  );
};
