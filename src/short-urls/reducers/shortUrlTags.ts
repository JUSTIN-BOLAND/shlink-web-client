import { Action, Dispatch } from 'redux';
import { buildActionCreator, buildReducer } from '../../utils/helpers/redux';
import { GetState } from '../../container/types';
import { OptionalString } from '../../utils/utils';
import { ShortUrlIdentifier } from '../data';
import { ShlinkApiClientBuilder } from '../../utils/services/ShlinkApiClientBuilder';

/* eslint-disable padding-line-between-statements */
export const EDIT_SHORT_URL_TAGS_START = 'shlink/shortUrlTags/EDIT_SHORT_URL_TAGS_START';
export const EDIT_SHORT_URL_TAGS_ERROR = 'shlink/shortUrlTags/EDIT_SHORT_URL_TAGS_ERROR';
export const SHORT_URL_TAGS_EDITED = 'shlink/shortUrlTags/SHORT_URL_TAGS_EDITED';
export const RESET_EDIT_SHORT_URL_TAGS = 'shlink/shortUrlTags/RESET_EDIT_SHORT_URL_TAGS';
/* eslint-enable padding-line-between-statements */

export interface ShortUrlTags {
  shortCode: string | null;
  tags: string[];
  saving: boolean;
  error: boolean;
}

export interface EditShortUrlTagsAction extends Action<string>, ShortUrlIdentifier {
  tags: string[];
}

const initialState: ShortUrlTags = {
  shortCode: null,
  tags: [],
  saving: false,
  error: false,
};

export default buildReducer<ShortUrlTags, EditShortUrlTagsAction>({
  [EDIT_SHORT_URL_TAGS_START]: (state) => ({ ...state, saving: true, error: false }),
  [EDIT_SHORT_URL_TAGS_ERROR]: (state) => ({ ...state, saving: false, error: true }),
  [SHORT_URL_TAGS_EDITED]: (_, { shortCode, tags }) => ({ shortCode, tags, saving: false, error: false }),
  [RESET_EDIT_SHORT_URL_TAGS]: () => initialState,
}, initialState);

export const editShortUrlTags = (buildShlinkApiClient: ShlinkApiClientBuilder) => (
  shortCode: string,
  domain: OptionalString,
  tags: string[],
) => async (dispatch: Dispatch, getState: GetState) => {
  dispatch({ type: EDIT_SHORT_URL_TAGS_START });
  const { updateShortUrlTags } = buildShlinkApiClient(getState);

  try {
    const normalizedTags = await updateShortUrlTags(shortCode, domain, tags);

    dispatch<EditShortUrlTagsAction>({ tags: normalizedTags, shortCode, domain, type: SHORT_URL_TAGS_EDITED });
  } catch (e) {
    dispatch({ type: EDIT_SHORT_URL_TAGS_ERROR });

    throw e;
  }
};

export const resetShortUrlsTags = buildActionCreator(RESET_EDIT_SHORT_URL_TAGS);
