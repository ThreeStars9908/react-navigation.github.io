import { useColorMode } from '@docusaurus/theme-common';
import MDXPre from '@theme-original/MDXComponents/Pre';
import CodeBlock from '@theme-original/CodeBlock';
import React from 'react';

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
  'data-name': name,
  'data-snack': snack,
  'data-version': version,
  'data-dependencies': deps,
  ...rest
}) {
  const { colorMode } = useColorMode();

  if (snack) {
    let code = React.Children.only(children).props.children;

    if (typeof code !== 'string') {
      throw new Error(
        'Playground code must be a string, but received ' + typeof code
      );
    }

    // Remove highlight comments from code
    code = code
      .split('\n')
      .filter((line) =>
        [
          '// highlight-start',
          '// highlight-end',
          '// highlight-next-line',
        ].every((comment) => line.trim() !== comment)
      )
      .join('\n');

    const dependencies = deps
      ? Object.fromEntries(deps.split(',').map((entry) => entry.split('@')))
      : {};

    Object.assign(
      dependencies,
      Object.entries(versions[version]).reduce((acc, [key, value]) => {
        if (code.includes(`from '${key}'`)) {
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
    const url = new URL('https://staging-snack.expo.dev');

    if (name) {
      url.searchParams.set('name', name);
    }

    url.searchParams.set('code', code);
    url.searchParams.set(
      'dependencies',
      Object.entries(dependencies)
        .map(([key, value]) => `${key}@${value}`)
        .join(',')
    );

    url.searchParams.set('platform', 'web');
    url.searchParams.set('supportedPlatforms', 'ios,android,web');
    url.searchParams.set('preview', 'true');
    url.searchParams.set('hideQueryParams', 'true');

    if (snack === 'embed') {
      url.searchParams.set('theme', colorMode === 'dark' ? 'dark' : 'light');
      url.pathname = 'embedded';

      return (
        <iframe
          src={url.href}
          style={{
            width: '100%',
            height: 660,
            border: 'none',
            border: '1px solid var(--ifm-table-border-color)',
            borderRadius: 'var(--ifm-global-radius)',
            overflow: 'hidden',
          }}
        />
      );
    }

    const link = (
      <a
        className="snack-sample-link"
        data-snack="true"
        target="_blank"
        href={url.href}
      >
        Try this example on Snack{' '}
        <svg
          width="14px"
          height="14px"
          viewBox="0 0 16 16"
          style={{ verticalAlign: '-1px' }}
        >
          <g stroke="none" strokeWidth="1" fill="none">
            <polyline
              stroke="currentColor"
              points="8.5 0.5 15.5 0.5 15.5 7.5"
            />
            <path d="M8,8 L15.0710678,0.928932188" stroke="currentColor" />
            <polyline
              stroke="currentColor"
              points="9.06944444 3.5 1.5 3.5 1.5 14.5 12.5 14.5 12.5 6.93055556"
            />
          </g>
        </svg>
      </a>
    );

    if (snack === 'link') {
      return link;
    }

    // For rendering the code snippet, remove snack-only lines
    const lines = code.split('\n');

    let content = '';
    let snackOnly = false;

    for (const line of lines) {
      if (line.trim() === '// snack-only-start') {
        snackOnly = true;
      } else if (line.trim() === '// snack-only-end') {
        snackOnly = false;

        // Remove multiple new lines from the last content
        content = content.trim() + '\n';
      } else if (!snackOnly) {
        content += line + '\n';
      }
    }

    content = content.trim();
    children = React.Children.map(children, (child) =>
      React.cloneElement(child, { children: content })
    );

    return (
      <>
        <MDXPre {...rest}>{children}</MDXPre>
        {link}
      </>
    );
  }

  return <MDXPre {...rest}>{children}</MDXPre>;
}
