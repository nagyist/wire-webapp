/*
 * Wire
 * Copyright (C) 2018 Wire Swiss GmbH
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

import {FC, Fragment, MouseEvent as ReactMouseEvent, useCallback, useEffect, useState} from 'react';

import {QualifiedId} from '@wireapp/api-client/lib/user';
import {WebAppEvents} from '@wireapp/webapp-events';
import {amplify} from 'amplify';
import cx from 'classnames';

import {Icon} from 'Components/Icon';
import {Image} from 'Components/Image';
import {Text} from 'src/script/entity/message/Text';
import {useKoSubscribableChildren} from 'Util/ComponentUtil';
import {includesOnlyEmojis} from 'Util/EmojiUtil';
import {t} from 'Util/LocalizerUtil';
import {formatDateNumeral, formatTimeShort, isBeforeToday} from 'Util/TimeUtil';

import {AudioAsset} from './asset/AudioAsset';
import {FileAsset} from './asset/FileAssetComponent';
import {LocationAsset} from './asset/LocationAsset';
import {RenderShowMsgBtn} from './asset/RenderShowMsgBtn';
import {TextMessageRenderer, ElementType} from './asset/TextMessageRenderer';
import {VideoAsset} from './asset/VideoAsset';

import type {Conversation} from '../../../../entity/Conversation';
import type {ContentMessage} from '../../../../entity/message/ContentMessage';
import type {User} from '../../../../entity/User';
import {ConversationError} from '../../../../error/ConversationError';
import {QuoteEntity} from '../../../../message/QuoteEntity';

export interface QuoteProps {
  conversation: Conversation;
  findMessage: (conversation: Conversation, messageId: string) => Promise<ContentMessage | undefined>;
  focusMessage: (id: string) => void;
  handleClickOnMessage: (message: Text, event: MouseEvent | KeyboardEvent, elementType: ElementType) => void;
  quote: QuoteEntity;
  selfId: QualifiedId;
  showDetail: (message: ContentMessage, event: ReactMouseEvent) => void;
  showUserDetails: (user: User) => void;
  focusConversation: boolean;
}

const Quote: FC<QuoteProps> = ({
  conversation,
  findMessage,
  focusMessage,
  handleClickOnMessage,
  quote,
  selfId,
  showDetail,
  showUserDetails,
  focusConversation,
}) => {
  const [quotedMessage, setQuotedMessage] = useState<ContentMessage>();
  const [error, setError] = useState<Error | string | undefined>(quote.error);

  useEffect(() => {
    const handleQuoteDeleted = (messageId: string) => {
      if (quotedMessage?.id === messageId) {
        setError(QuoteEntity.ERROR.MESSAGE_NOT_FOUND);
        setQuotedMessage(undefined);
      }
    };

    const handleQuoteUpdated = (originalMessageId: string, messageEntity: ContentMessage) => {
      if (quotedMessage?.id === originalMessageId) {
        setQuotedMessage(messageEntity);
      }
    };

    amplify.subscribe(WebAppEvents.CONVERSATION.MESSAGE.REMOVED, handleQuoteDeleted);
    amplify.subscribe(WebAppEvents.CONVERSATION.MESSAGE.UPDATED, handleQuoteUpdated);

    return () => {
      amplify.unsubscribe(WebAppEvents.CONVERSATION.MESSAGE.REMOVED, handleQuoteDeleted);
      amplify.unsubscribe(WebAppEvents.CONVERSATION.MESSAGE.UPDATED, handleQuoteUpdated);
    };
  }, [quotedMessage]);

  useEffect(() => {
    if (!error && quote.messageId) {
      findMessage(conversation, quote.messageId)
        .then(message => {
          setQuotedMessage(message as ContentMessage);
        })
        .catch(error => {
          if (error.type === ConversationError.TYPE.MESSAGE_NOT_FOUND) {
            return setError(QuoteEntity.ERROR.MESSAGE_NOT_FOUND);
          }
          throw error;
        });
    }
  }, [quote, error]);

  return !quotedMessage && !error ? (
    <div />
  ) : (
    <div className="message-quote" data-uie-name="quote-item">
      {error ? (
        <div className="message-quote__error" data-uie-name="label-error-quote">
          {t('replyQuoteError')}
        </div>
      ) : (
        quotedMessage && (
          <QuotedMessage
            quotedMessage={quotedMessage}
            selfId={selfId}
            focusMessage={focusMessage}
            handleClickOnMessage={handleClickOnMessage}
            showDetail={showDetail}
            showUserDetails={showUserDetails}
            focusConversation={focusConversation}
          />
        )
      )}
    </div>
  );
};

interface QuotedMessageProps {
  focusMessage: (id: string) => void;
  handleClickOnMessage: (message: Text, event: MouseEvent | KeyboardEvent, elementType: ElementType) => void;
  quotedMessage: ContentMessage;
  selfId: QualifiedId;
  showDetail: (message: ContentMessage, event: ReactMouseEvent) => void;
  showUserDetails: (user: User) => void;
  focusConversation: boolean;
}

const QuotedMessage: FC<QuotedMessageProps> = ({
  quotedMessage,
  focusMessage,
  selfId,
  handleClickOnMessage,
  showDetail,
  showUserDetails,
  focusConversation,
}) => {
  const {
    user: quotedUser,
    assets: quotedAssets,
    headerSenderName,
    was_edited,
    timestamp,
    edited_timestamp,
  } = useKoSubscribableChildren(quotedMessage, [
    'user',
    'assets',
    'headerSenderName',
    'was_edited',
    'timestamp',
    'edited_timestamp',
  ]);
  const [showFullText, setShowFullText] = useState(false);
  const [canShowMore, setCanShowMore] = useState(false);

  useEffect(() => {
    setShowFullText(false);
  }, [quotedMessage]);

  const handleMsgQuoteClick = useCallback(
    (event: MouseEvent | KeyboardEvent, asset: Text, elementType: ElementType): void => {
      handleClickOnMessage(asset, event, elementType);
    },
    [handleClickOnMessage],
  );

  return (
    <>
      <div className="message-quote__sender">
        <button
          type="button"
          className="button-reset-default"
          onClick={() => showUserDetails(quotedUser)}
          data-uie-name="label-name-quote"
          tabIndex={focusConversation ? 0 : -1}
        >
          {headerSenderName}
        </button>
        {was_edited && (
          <span data-uie-name="message-edited-quote" title={quotedMessage.displayEditedTimestamp()}>
            <Icon.Edit />
          </span>
        )}
      </div>
      {quotedAssets.map((asset, index) => (
        <Fragment key={index}>
          {asset.isImage() && (
            <div data-uie-name="media-picture-quote">
              <Image
                className="message-quote__image"
                asset={asset.resource()}
                aspectRatio={asset.ratio}
                click={(asset, event) => showDetail(quotedMessage, event)}
              />
            </div>
          )}

          {asset.isText() && (
            <>
              <TextMessageRenderer
                onClickMsg={handleMsgQuoteClick}
                text={asset.render(selfId)}
                msgClass={cx('message-quote__text', {
                  'message-quote__text--full': showFullText,
                  'message-quote__text--large': includesOnlyEmojis(asset.text),
                })}
                isCurrentConversationFocused={focusConversation}
                asset={asset}
                data-uie-name="media-text-quote"
                isQuoteMsg={true}
                setCanShowMore={setCanShowMore}
                edited_timestamp={edited_timestamp}
              />
              {canShowMore && (
                <RenderShowMsgBtn
                  showFullText={showFullText}
                  setShowFullText={setShowFullText}
                  isCurrentConversationFocused={focusConversation}
                />
              )}
            </>
          )}

          {asset.isVideo() && (
            <VideoAsset
              isQuote
              message={quotedMessage}
              // className="message-quote__video"
              data-uie-name="media-video-quote"
            />
          )}

          {asset.isAudio() && (
            <AudioAsset message={quotedMessage} className="message-quote__audio" data-uie-name="media-audio-quote" />
          )}

          {asset.isFile() && (
            <FileAsset
              message={quotedMessage}
              // className="message-quote__file"
              data-uie-name="media-file-quote"
            />
          )}

          {asset.isLocation() && <LocationAsset asset={asset} data-uie-name="media-location-quote" />}
        </Fragment>
      ))}
      <button
        type="button"
        className="button-reset-default message-quote__timestamp"
        onClick={() => {
          if (quotedMessage) {
            focusMessage(quotedMessage.id);
          }
        }}
        data-uie-name="label-timestamp-quote"
        tabIndex={focusConversation ? 0 : -1}
      >
        {isBeforeToday(timestamp)
          ? t('replyQuoteTimeStampDate', formatDateNumeral(timestamp))
          : t('replyQuoteTimeStampTime', formatTimeShort(timestamp))}
      </button>
    </>
  );
};

export {Quote, QuotedMessage};
