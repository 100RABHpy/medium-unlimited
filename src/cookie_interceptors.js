import {urlWithoutQueryParams} from './utils';

const urlsList = [
  'https://medium.com/*',
  'https://www.google.com/*',
  'https://towardsdatascience.com/*',
  'https://hackernoon.com/*',
  'https://medium.freecodecamp.org/*',
  'https://psiloveyou.xyz/*',
  'https://betterhumans.coach.me/*',
];

export default function intercept(inProgressUrls) {
  function onBeforeSendHeaders(details) {
    if (details.requestHeaders && shouldIntercept(details)) {
      let newHeaders = removeHeader(details.requestHeaders, 'cookie');
      newHeaders = removeHeader(newHeaders, 'origin');

      return {requestHeaders: newHeaders};
    }
    return {requestHeaders: details.requestHeaders};
  }

  chrome.webRequest.onBeforeSendHeaders.addListener(
    onBeforeSendHeaders,
    {
      urls: urlsList,
    },
    ['requestHeaders', 'blocking']
  );

  function onHeadersReceived(details) {
    if (details.responseHeaders && shouldIntercept(details)) {
      const newHeaders = removeHeader(details.responseHeaders, 'set-cookie');
      return {responseHeaders: newHeaders};
    }
    return {responseHeaders: details.responseHeaders};
  }

  chrome.webRequest.onHeadersReceived.addListener(
    onHeadersReceived,
    {
      urls: urlsList,
    },
    ['responseHeaders', 'blocking']
  );

  function removeHeader(headers, headerToRemove) {
    return headers.filter(({name}) => name.toLowerCase() != headerToRemove);
  }

  function shouldIntercept(details) {
    return (
      inProgressUrls[urlWithoutQueryParams(details.url)] ||
      details.url.startsWith(
        'https://medium.com/m/global-identity?redirectUrl='
      )
    );
  }
}
