export function isVideoFile(data) {
    if (data === null || data === undefined) {
        return '';
    }
    const videoFileTypes = ['mp4', 'mov', 'avi', 'wmv', 'flv', 'avchd'];
    return videoFileTypes.includes(data);
}

export function isSubtitleFile(data) {
    if (data === null || data === undefined) {
        return '';
    }
    const subtitleFileTypes = ['vtt']; // Does not support .srt at the moment
    return subtitleFileTypes.includes(data);
}

import SUBTITLE_LINK from '@salesforce/label/c.NKS_Subtitle_Link';
import COPY_FAIL from '@salesforce/label/c.NKS_Copy_Message_Fail';
import VIDEO_LIBRARY_LINK from '@salesforce/label/c.NKS_Video_Library_Link';
import NORWEGIAN_LABEL from '@salesforce/label/c.NKS_Subtitle_Language_Norwegian';
import ENGLISH_LABEL from '@salesforce/label/c.NKS_Subtitle_Language_English';
import POLISH_LABEL from '@salesforce/label/c.NKS_Subtitle_Language_Polish';
import DELETE from '@salesforce/label/c.NKS_Button_Delete';
import SAVE from '@salesforce/label/c.NKS_Button_Save';
import LANGUAGE from '@salesforce/label/c.NKS_Subtitle_Column_Header';
import LINK from '@salesforce/label/c.NKS_Subtitle_Link';
import SAVE_SUCCESS from '@salesforce/label/c.NKS_Save_Message_Success';
import SAVE_FAIL from '@salesforce/label/c.NKS_Save_Message_Fail';
import SUBTITLE_WARNING from '@salesforce/label/c.NKS_Subtitle_Warning';
import SUBTITLE_COMBOBOX_PLACEHOLDER from '@salesforce/label/c.NKS_Subtitle_Combobox_Placeholder';
import SUBTITLE_PLACEHOLDER from '@salesforce/label/c.NKS_Subtitle_Placeholder';
import SUBTITLE_HEADER from '@salesforce/label/c.NKS_Subtitles';
import SUBTITLE_BUTTON_TITLE from '@salesforce/label/c.NKS_Subtitle_Button_Title';
import THUMBNAIL_SAVE from '@salesforce/label/c.NKS_Thumbnail_Save';
import THUMBNAIL_LINK from '@salesforce/label/c.NKS_Thumbnail_Link';
import THUMBNAIL_PLACEHOLDER from '@salesforce/label/c.NKS_Thumbnail_Placeholder';
import THUMBNAIL_BUTTON_TITLE from '@salesforce/label/c.NKS_Thumbnail_Button_Title';
import EMBEDDING_CODE from '@salesforce/label/c.NKS_Embedding_Code';

export default {
    SUBTITLE_LINK,
    COPY_FAIL,
    VIDEO_LIBRARY_LINK,
    NORWEGIAN_LABEL,
    ENGLISH_LABEL,
    POLISH_LABEL,
    DELETE,
    SAVE,
    LANGUAGE,
    LINK,
    SAVE_SUCCESS,
    SAVE_FAIL,
    SUBTITLE_WARNING,
    SUBTITLE_COMBOBOX_PLACEHOLDER,
    SUBTITLE_PLACEHOLDER,
    SUBTITLE_HEADER,
    SUBTITLE_BUTTON_TITLE,
    THUMBNAIL_SAVE,
    THUMBNAIL_LINK,
    THUMBNAIL_PLACEHOLDER,
    THUMBNAIL_BUTTON_TITLE,
    EMBEDDING_CODE
};