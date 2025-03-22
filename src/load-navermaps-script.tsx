import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';

import type { ClientOptions } from './types/client';
import { loadScript } from './utils/load-script';

export function loadNavermapsScript(options: ClientOptions) {
  const url = makeUrl(options);

  // TODO: Caching Promise

  const promise = loadScript(url).then(() => {
    const navermaps = window.naver.maps;

    if (navermaps.jsContentLoaded) {
      return navermaps;
    }

    return new Promise<typeof naver.maps>(resolve => {
      navermaps.onJSContentLoaded = () => {
        resolve(navermaps);
      };
    });
  });

  return promise;
}

function makeUrl(options: ClientOptions) {
  const submodules = options.submodules;
  let clientIdQuery: string | null = null;

  ['ncpClientId', 'ncpKeyId', 'govClientId', 'finClientId'].forEach(key => {
    if (key in options) {
      clientIdQuery = `${key}=${options[key as keyof ClientOptions]}`;
    }
  });

  if (!clientIdQuery) {
    throw new Error('react-naver-maps: ncpClientId, govClientId or finClientId is required');
  }

  let url = `https://oapi.map.naver.com/openapi/v3/maps.js?${clientIdQuery}`;

  if (submodules) {
    url += `&submodules=${submodules.join(',')}`;
  }

  return url;
}

type Props = ClientOptions & {
  children: () => ReactElement;
};

export function LoadNavermapsScript({
  children: Children,
  ...options
}: Props) {
  const [navermaps, setNavermaps] = useState<typeof naver.maps>();

  useEffect(() => {
    loadNavermapsScript(options).then((maps) => {
      setNavermaps(maps);
    });
  }, []);

  return (
    (navermaps && Children) ? <Children /> : null
  );
}
