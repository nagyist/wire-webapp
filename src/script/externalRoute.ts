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

import {currentLanguage} from './auth/localeConfig';
import {Config} from './Config';

const env = window.wire.env;

export const URL = {
  ACCOUNT: env.URL?.ACCOUNT_BASE,
  PRIVACY_POLICY: env.URL?.PRIVACY_POLICY,
  SUPPORT: env.URL?.SUPPORT.INDEX,
  TEAM_SETTINGS: env.URL?.TEAMS_BASE,
  TERMS_OF_USE_PERSONAL: env.URL?.TERMS_OF_USE_PERSONAL,
  TERMS_OF_USE_TEAMS: env.URL?.TERMS_OF_USE_TEAMS,
  WEBAPP: {
    INTERNAL: 'https://wire-webapp-staging.wire.com',
    PRODUCTION: env.APP_BASE || 'https://app.wire.com',
    STAGING: 'https://wire-webapp-staging.zinfra.io',
  },
  WEBSITE: env.URL?.WEBSITE_BASE,
};

export const URL_PATH = {
  CREATE_TEAM: '/create-team/',
  DECRYPT_ERROR_1: '/articles/207948115',
  DECRYPT_ERROR_2: '/privacy/error-2/',
  MANAGE_SERVICES: '/services/',
  MANAGE_TEAM: '/login/',
  PASSWORD_RESET: '/forgot/',
  PRIVACY_HOW: '/privacy/how/',
  PRIVACY_UNVERIFIED_USERS: '/articles/202857164',
  PRIVACY_WHY: '/articles/207859815',
  SUPPORT_USERNAME: '/support/username/',
} as const;

const getTeamSettingsUrl = (path: string = '', utmSource?: string): string | undefined => {
  const query = utmSource ? `?utm_source=${utmSource}&utm_term=desktop` : '';
  const teamSettingsUrl = `${URL.TEAM_SETTINGS}${path}${query}`;
  return URL.TEAM_SETTINGS ? teamSettingsUrl : undefined;
};

export const getWebsiteUrl = (path: string = '', pkCampaign?: string): string | undefined => {
  if (URL.WEBSITE) {
    const query = pkCampaign ? `?pk_campaign=${pkCampaign}&pk_kwd=desktop` : '';
    const websiteUrl = `${URL.WEBSITE}${path}${query}`;
    return addLocaleToUrl(URL.WEBSITE ? websiteUrl : undefined);
  }
  return undefined;
};

const getHelpCenterUrl = (path: (typeof URL_PATH)[keyof typeof URL_PATH]) => {
  if (URL.SUPPORT) {
    const helpcenterUrl = `${URL.SUPPORT}${path}`;
    return addLocaleToHelpCenterUrl(URL.SUPPORT ? helpcenterUrl : undefined);
  }
  return undefined;
};

export const getAccountPagesUrl = (path: string = ''): string | undefined => {
  const accountPagesUrl = `${URL.ACCOUNT}${path}`;
  return URL.ACCOUNT ? accountPagesUrl : undefined;
};

export const getPrivacyPolicyUrl = (): string => addLocaleToUrl(URL.PRIVACY_POLICY || undefined);
export const getTermsOfUsePersonalUrl = (): string => addLocaleToUrl(URL.TERMS_OF_USE_PERSONAL || undefined);
export const getTermsOfUseTeamUrl = (): string => addLocaleToUrl(URL.TERMS_OF_USE_TEAMS || undefined);

export const getManageServicesUrl = (utmSource?: string): string =>
  getTeamSettingsUrl(URL_PATH.MANAGE_SERVICES, utmSource);
export const getManageTeamUrl = (utmSource?: string): string => getTeamSettingsUrl(URL_PATH.MANAGE_TEAM, utmSource);

export const getCreateTeamUrl = (): string =>
  Config.getConfig().FEATURE.ENABLE_ACCOUNT_REGISTRATION && `${Config.getConfig().URL.TEAMS_BASE}/register/email`;
export const getDecryptErrorUrl = (): string => getHelpCenterUrl(URL_PATH.DECRYPT_ERROR_1);
export const getPrivacyUnverifiedUsersUrl = (): string => getHelpCenterUrl(URL_PATH.PRIVACY_UNVERIFIED_USERS);
export const getPrivacyWhyUrl = (): string => getHelpCenterUrl(URL_PATH.PRIVACY_WHY);

export const addLocaleToUrl = (url?: string): string => {
  if (!url) {
    return undefined;
  }
  const language = currentLanguage().slice(0, 2);
  const websiteLanguage = language == 'de' ? language : 'en';
  return url.replace(Config.getConfig().URL.WEBSITE_BASE, `${Config.getConfig().URL.WEBSITE_BASE}/${websiteLanguage}`);
};

const addLocaleToHelpCenterUrl = (url?: string): string => {
  if (!url) {
    return undefined;
  }
  const language = currentLanguage().slice(0, 2);
  const websiteLanguage = language == 'de' ? language : 'en-us';
  return url.replace(
    `${Config.getConfig().URL.SUPPORT.INDEX}`,
    `${Config.getConfig().URL.SUPPORT.INDEX}/hc/${websiteLanguage}`,
  );
};
