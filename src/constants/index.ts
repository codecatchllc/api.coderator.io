export const ACCESS_TOKEN_KEY = 'cc.access-token';
export const REFRESH_TOKEN_KEY = 'cc.refresh-token';
export const COLOR_SCHEME_KEY = 'cc.color-scheme';
export const ACCESS_TOKEN_LIFESPAN = 1000 * 60 * 60 * 24; // 1000 miliseconds * 60 sec * 60 min * 24 hours
export const REFRESH_TOKEN_LIFESPAN = 1000 * 60 * 60 * 24 * 90; // 1000 miliseconds * 60 sec * 60 min * 24 hours * 90 days
export const PRIVATE = 'private' as string;
export const PUBLIC = 'public' as string;
export const UNLISTED = 'unlisted' as string;
export const PRIVACY_OPTIONS = [PUBLIC, PRIVATE, UNLISTED];
export const DEFAULT_TITLE = 'Untitled';
export const DEFAULT_LANGUAGE = 'plaintext';
export const OLDEST = 'oldest';
export const NEWEST = 'newest';
export const ALL = 'all';
export const POSTS_PER_PAGE = 10;
export const MAX_PSQL_INT = 2147483647;
export const EMAIL_CHAR_MIN = 3;
export const EMAIL_CHAR_MAX = 255;
export const PASSWORD_CHAR_MIN = 5;
export const PASSWORD_CHAR_MAX = 255;
export const USERNAME_CHAR_MIN = 3;
export const USERNAME_CHAR_MAX = 30;
export const POST_TITLE_CHAR_MAX = 70;
export const POST_CONTENT_CHAR_MAX = 40_000;
export const POST_LANGUAGE_CHAR_MAX = 50;
export const SEARCH_QUERY_MAX_WORDS = 32;
export const AVERAGE_WORD_LENGTH = 5;
export const EMAIL_REGEX =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
export const LANGUAGE_OPTIONS = [
  'abap',
  'aes',
  'apex',
  'azcli',
  'bat',
  'bicep',
  'c',
  'cameligo',
  'clojure',
  'coffeescript',
  'cpp',
  'csharp',
  'csp',
  'css',
  'dart',
  'dockerfile',
  'ecl',
  'elixir',
  'flow9',
  'freemarker2',
  'freemarker2.tag-angle.interpolation-bracket',
  'freemarker2.tag-angle.interpolation-dollar',
  'freemarker2.tag-auto.interpolation-bracket',
  'freemarker2.tag-auto.interpolation-dollar',
  'freemarker2.tag-bracket.interpolation-bracket',
  'freemarker2.tag-bracket.interpolation-dollar',
  'fsharp',
  'go',
  'graphql',
  'handlebars',
  'hcl',
  'html',
  'ini',
  'java',
  'javascript',
  'json',
  'julia',
  'kotlin',
  'less',
  'lexon',
  'liquid',
  'lua',
  'm3',
  'markdown',
  'mips',
  'msdax',
  'mysql',
  'objective-c',
  'pascal',
  'pascaligo',
  'perl',
  'pgsql',
  'php',
  'pla',
  'plaintext',
  'postiats',
  'powerquery',
  'powershell',
  'proto',
  'pug',
  'python',
  'qsharp',
  'r',
  'razor',
  'redis',
  'redshift',
  'restructuredtext',
  'ruby',
  'rust',
  'sb',
  'scala',
  'scheme',
  'scss',
  'shell',
  'sol',
  'sparql',
  'sql',
  'st',
  'swift',
  'systemverilog',
  'tcl',
  'twig',
  'typescript',
  'vb',
  'verilog',
  'xml',
  'yaml',
];