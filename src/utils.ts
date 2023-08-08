import {
  DocFileIcon,
  DocxFileIcon,
  JpgFileIcon,
  OtherFileIcon,
  PdfFileIcon,
  PngFileIcon,
  PptFileIcon,
  PptxFileIcon,
  RarFileIcon,
  WpsFileIcon,
  XlsFileIcon,
  XlsxFileIcon,
  ZipFileIcon,
} from '../icons';
import type { FileItemType, UploadProps } from "./types";

const ERROR_MESSAGE = {
  INVALID_FILE_SIZE: 'INVALID_FILE_SIZE',
}

export const generateFileValue = (fileList: FileList | null, hasFetch: boolean) => {
  if(!fileList) {
    return undefined;
  }
  const generatedValue: FileItemType[] = [];
  for(let i = 0; i < fileList.length; i++) {
    const file = fileList.item(i);
    if(!file) {
      continue;
    }
    generatedValue.push({
      file,
      progress: 0,
      status: hasFetch ? 'init' : 'success',
      url: null,
    })
  }
  return generatedValue;
}

export const mergeFileValue = (fileList: FileItemType[], value: FileItemType[] | undefined, props: UploadProps) => {
  const { maxSize, multiple, onError } = props;

  let hasInvalidSize = false;
  const filteredList = typeof maxSize === 'number' ? fileList.filter(item => {
    const flag = item.file.size <= maxSize;
    if(!flag) hasInvalidSize = true;
    return flag;
  }) : fileList;
  if(hasInvalidSize) {
    onError?.(new Error(ERROR_MESSAGE.INVALID_FILE_SIZE));
  }

  let mergedValue = undefined;
  const totalList = (value ?? []).concat(filteredList);
  const totalLength = totalList.length;
  if (!multiple) {
    if(!totalLength) return undefined;
    mergedValue = [totalList[totalLength - 1]]
  } else if(multiple === true) {
    mergedValue = totalList;
  } else {
    const remainLength = typeof multiple === 'number' && multiple > 0 ? multiple - totalLength : 0;
    if(remainLength >= 0) {
      mergedValue = totalList;
    } else {
      mergedValue = totalList.slice(-remainLength);
    }
  }
  return Array.isArray(mergedValue) && mergedValue?.length > 0 ? mergedValue : undefined;
}

const isNormalObject = (data: unknown): data is Record<string, string> | Array<unknown> => {
  if(Object.prototype.toString.call(data) === '[object Object]' || Object.prototype.toString.call(data) === '[object Array]') {
    return true;
  }
  return false;
}

export const convertFileTypeToImg = (type: string) => {
  switch(type.toUpperCase()) {
    case 'DOC':
      return DocFileIcon;
    case 'DOCX':
      return DocxFileIcon;
    case 'JPG':
      return JpgFileIcon;
    case 'PDF':
      return PdfFileIcon;
    case 'PNG':
      return PngFileIcon;
    case 'PPT':
      return PptFileIcon;
    case 'PPTX':
      return PptxFileIcon;
    case 'RAR':
      return RarFileIcon;
    case 'WPS':
      return WpsFileIcon;
    case 'XLS':
      return XlsFileIcon;
    case 'XLSX':
      return XlsxFileIcon;
    case 'ZIP':
      return ZipFileIcon;
    default:
      return OtherFileIcon;
  }
}

export interface UploadRequestOptions {
  url: string;
  method: string;
  headers?: Headers | Record<string, string>;
  responseType?: XMLHttpRequest['responseType'];
  data?: Document | XMLHttpRequestBodyInit | Record<string, string> | null;
  params?: string | Record<string, string> | URLSearchParams;
  timeout?: number;
  withCredentials?: boolean;
  onProgress?: XMLHttpRequest['onprogress'];
  onUploadProgress?: XMLHttpRequest['upload']['onprogress'];
}
export class UploadAjax {
  public ajax?: XMLHttpRequest;

  public setRequestHeader (headers?: Headers | Record<string, string>) {
    if (!headers || !this.ajax) {
      return;
    }
    const ajax = this.ajax;
    if(headers instanceof Headers) {
      headers.forEach((value, key) => {
        ajax.setRequestHeader(key, value);
      })
    } else {
      Object.keys(headers).forEach(key => {
        ajax.setRequestHeader(key, headers[key]);
      })
    }
  }

  public request<T> (options: UploadRequestOptions) {
    this.ajax?.abort();
    const { url, headers, responseType = 'json', data, params, timeout, withCredentials, onProgress, onUploadProgress } = options;
    const ajax = new XMLHttpRequest();
    this.ajax = ajax;
    const method = options.method.toUpperCase();
    let paramsString = params;
    let dataString: Document | XMLHttpRequestBodyInit | null | undefined;
    if(['GET', 'HEAD'].includes(method)) {
      if(params instanceof URLSearchParams) {
        paramsString = params.toString();
      } else if (typeof params === 'object') {
        paramsString = new URLSearchParams(params).toString();
      }
      ajax.open(method, `${url}?${paramsString}`, true);
    } else {
      if(isNormalObject(data)) {
        dataString = new URLSearchParams(data);
      } else {
        dataString = data;
      }
      ajax.open(method, url, true);
    }
    this.setRequestHeader(headers);
    ajax.responseType = responseType;
    if(typeof timeout === 'number') ajax.timeout = timeout;
    if(typeof withCredentials === 'boolean') ajax.withCredentials = withCredentials;
    ajax.onprogress = onProgress ?? null;
    ajax.upload.onprogress = onUploadProgress ?? null;
    return new Promise<T>((resolve, reject) => {
      ajax.onreadystatechange = () => {
        if(ajax.readyState === ajax.DONE) {
          if(ajax.status === 200) {
            resolve(ajax.response);
          } else {
            reject(new Error('request error'))
          }
        }
      };
      ajax.onabort = () => {
        reject(new Error('request has been aborted'))
      }
      ajax.onerror = () => {
        reject(new Error('request error'))
      }
      ajax.ontimeout = () => {
        reject(new Error('request timeout'));
      }
      ajax.send(dataString);
    });
  }
}
