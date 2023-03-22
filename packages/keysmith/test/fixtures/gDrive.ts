export const unauthenticatedResponse = {
  'error': {
    'code': 401,
    'message': 'Request had invalid authentication credentials. Expected OAuth 2 access token, login cookie or other valid authentication credential. See https://developers.google.com/identity/sign-in/web/devconsole-project.',
    'errors': [
      {
        'message': 'Invalid Credentials',
        'domain': 'global',
        'reason': 'authError',
        'location': 'Authorization',
        'locationType': 'header',
      },
    ],
    'status': 'UNAUTHENTICATED',
  },
}

export const couldNotFindFileIdResponse = {
  'error': {
    'code': 404,
    'message': 'File not found: rando.',
    'errors': [
      {
        'message': 'File not found: rando.',
        'domain': 'global',
        'reason': 'notFound',
        'location': 'fileId',
        'locationType': 'parameter',
      },
    ],
  },
}

export const uploadSuccessResponse = (id: string) => {
  return {
    kind: 'drive#file',
    id,
    name: 'foo_bar.json',
    mimeType: 'application/json',
  }
}