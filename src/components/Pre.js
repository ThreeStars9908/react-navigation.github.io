import MDXPre from '@theme-original/MDXComponents/Pre';
import CodeBlock from '@theme-original/CodeBlock';

const peers = {
  'react-native-safe-area-context': '*',
  'react-native-screens': '*',
};

const versions = {
  7: {
    '@react-navigation/bottom-tabs': ['7.0.0-alpha.7', peers],
    '@react-navigation/core': '7.0.0-alpha.6',
    '@react-navigation/native': '7.0.0-alpha.6',
    '@react-navigation/drawer': [
      '7.0.0-alpha.7',
      {
        ...peers,
        'react-native-reanimated': '*',
      },
    ],
    '@react-navigation/elements': ['2.0.0-alpha.4', peers],
    '@react-navigation/material-top-tabs': [
      '7.0.0-alpha.6',
      {
        ...peers,
        'react-native-pager-view': '*',
      },
    ],
    '@react-navigation/native-stack': ['7.0.0-alpha.7', peers],
    '@react-navigation/routers': '7.0.0-alpha.4',
    '@react-navigation/stack': [
      '7.0.0-alpha.7',
      {
        ...peers,
        'react-native-gesture-handler': '*',
      },
    ],
    'react-native-drawer-layout': [
      '4.0.0-alpha.3',
      {
        'react-native-gesture-handler': '*',
        'react-native-reanimated': '*',
      },
    ],
    'react-native-tab-view': [
      '4.0.0-alpha.2',
      {
        'react-native-pager-view': '*',
      },
    ],
  },
};

export default function Pre({
  children,
  'data-title': title,
  'data-snack': snack,
  'data-version': version,
  'data-dependencies': deps,
  ...rest
}) {
  if (snack) {
    if (typeof children !== 'string') {
      throw new Error(
        'Playground pre children must be a string, but received ' +
          typeof children
      );
    }

    const dependencies = deps
      ? Object.fromEntries(deps.split(',').map((entry) => entry.split('@')))
      : {};

    Object.assign(
      dependencies,
      Object.entries(versions[version]).reduce((acc, [key, value]) => {
        if (children.includes(`from '${key}'`)) {
          if (Array.isArray(value)) {
            const [version, peers] = value;

            Object.assign(acc, {
              [key]: version,
              ...peers,
            });
          } else {
            acc[key] = value;
          }
        }

        return acc;
      }, {})
    );

    // FIXME: use staging for now since react-navigation fails to build on prod
    const url = new URL('https://staging-snack.expo.dev/embedded');

    if (title) {
      url.searchParams.set('name', title);
    }

    url.searchParams.set('code', children);
    url.searchParams.set(
      'dependencies',
      Object.entries(dependencies)
        .map(([key, value]) => `${key}@${value}`)
        .join(',')
    );

    url.searchParams.set('platform', 'web');
    url.searchParams.set('supportedPlatforms', 'ios,android,web');
    url.searchParams.set('theme', 'light');
    url.searchParams.set('preview', 'true');
    url.searchParams.set('hideQueryParams', 'true');

    console.log(url.href)

    return (
      <iframe
        loading="lazy"
        src={url.href}
        height="660px"
        width="100%"
        frameBorder="0"
        data-snack-iframe="true"
        style={{
          display: 'block',
          border: '1px solid var(--ifm-table-border-color)',
          borderRadius: 'var(--ifm-global-radius)',
        }}
      ></iframe>
    );
  }

  return <MDXPre {...rest}>{children}</MDXPre>;
}
