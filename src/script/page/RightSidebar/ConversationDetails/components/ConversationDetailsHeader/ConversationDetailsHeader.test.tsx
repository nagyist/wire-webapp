/*
 * Wire
 * Copyright (C) 2019 Wire Swiss GmbH
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

import {fireEvent, render} from '@testing-library/react';

import ConversationDetailsHeader from './ConversationDetailsHeader';

const INITIAL_TEST_DISPLAY_NAME = 'Test Group Name';

interface DefaultParamsProps {
  isActiveGroupParticipant?: boolean;
  canRenameGroup?: boolean;
  displayName?: string;
}

const getDefaultParams = ({
  isActiveGroupParticipant = false,
  canRenameGroup = false,
  displayName = INITIAL_TEST_DISPLAY_NAME,
}: DefaultParamsProps) => ({
  allUsersCount: 0,
  canRenameGroup,
  displayName,
  isActiveGroupParticipant,
  isGroup: true,
  isTeam: false,
  serviceParticipants: [],
  updateConversationName: (updatedName: string) => jest.fn(),
  userParticipants: [],
});

describe('ConversationDetailsHeader', () => {
  it('user rename group by click on Icon.Edit', async () => {
    const defaultProps = getDefaultParams({canRenameGroup: true, isActiveGroupParticipant: true});

    const {container} = render(<ConversationDetailsHeader {...defaultProps} />);
    const conversationName = container.querySelector('[data-uie-name="status-name"] .conversation-details__name');
    expect(conversationName!.innerHTML).toBe(INITIAL_TEST_DISPLAY_NAME);

    const iconEdit = container.querySelector('[data-uie-name="do-edit-group-name"]');
    expect(iconEdit).not.toBeNull();
    fireEvent.click(iconEdit!);

    const textarea = container.querySelector('[data-uie-name="enter-name"]');
    expect(textarea).not.toBeNull();
    expect(textarea!.innerHTML).toBe(INITIAL_TEST_DISPLAY_NAME);

    const newGroupName = 'Changed name of group';

    fireEvent.change(textarea!, {target: {value: newGroupName}});
    expect(textarea!.innerHTML).toBe(newGroupName);

    fireEvent.keyDown(textarea!, {charCode: 13, code: 13, key: 'Enter'});

    const updatedConversationName = container.querySelector(
      '[data-uie-name="status-name"] .conversation-details__name',
    );

    expect(updatedConversationName!.innerHTML).toBe(newGroupName);
  });
});
