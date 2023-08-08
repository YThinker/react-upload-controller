import type { FileItemType, UploadControllerItemProps, UploadControllerProps } from './types'
import React, { useEffect, useState } from 'react'
import { UploadAjax, generateFileValue, mergeFileValue } from './utils';
import { useCreation, useLatest, useUnmountedRef } from 'ahooks';
import type { ChangeEvent} from 'react';

/** 使用React组件生命周期管理文件上传流程，此为空元素 */
const UploadControllerItem = (props: UploadControllerItemProps) => {
  const { item, onUpdate, url, headers, formDataKey, fetch } = props;
  const itemRef = useLatest(item);
  const ajaxInstance = useCreation(() => new UploadAjax(), []);
  const unmountRef = useUnmountedRef();

  const handleUploadProgress = (percent: number) => {
    if(unmountRef.current) {
      return;
    }
    /** 高频更新 */
    onUpdate({
      ...itemRef.current,
      progress: percent,
    });
  }

  const requestFunction = async (params: Blob) => {
    if(fetch) {
      return fetch.request(params, (p) => handleUploadProgress(p));
    } else if(!url) {
      return { success: true };
    } else {
      ajaxInstance.setRequestHeader({
        'content-type': 'multipart/form-data',
        ...headers
      });
      const data = new FormData();
      data.append(formDataKey || 'file', params);
      return ajaxInstance.request<{ success: boolean; url?: string; }>({
        method: 'POST',
        data,
        url,
        timeout: 20000,
        onUploadProgress: (ev) => handleUploadProgress(ev.loaded / ev.total * 100),
      });
    }
  }

  const handleInit = async () => {
    let status: FileItemType['status'] = 'progress';
    onUpdate({
      ...item,
      status
    }, true);
    const res = await requestFunction?.(item.file).catch(() => {
      status = 'fail';
    });
    /** 防止传输中断等情况下发生的——因闭包导致的——被卸载的组件触发了更新 */
    if(unmountRef.current) {
      return;
    }
    status = res?.success ? 'success' : 'fail';
    /** 重要突变，传出finished参数，调用onChange */
    onUpdate({
      ...itemRef.current,
      status,
      progress: res?.success ? 100 : 0,
      url: res?.url ?? null
    }, true);
  }

  useEffect(() => {
    if(item.status === 'init') {
      handleInit();
    }

    return () => {
      if(!['success', 'fail'].includes(item.status)) {
        ajaxInstance.ajax?.abort();
        fetch?.abort?.();
      }
    }
  }, []);

  return null;
}

/**
 * 主组件
 * 维护所有状态，控制上传
 */
export default  (props: UploadControllerProps) => {
  const {
    value,
    children,
    multiple,
    maxSize,
    onError,
    onValueChange,
    onChange,
    url,
    headers,
    formDataKey,
    fetch,
  } = props;
  const [selfValue, setSelfValue] = useState<FileItemType[] | undefined>();

  useEffect(() => {
    setSelfValue(value);
  }, [value]);

  const handleListChange = (list?: FileItemType[]) => {
    setSelfValue(list);
    onValueChange?.(list);
    onChange?.(list);
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const hasFetch = !!fetch || !!url;
    const generatedValue = generateFileValue(e.target.files, hasFetch);
    if(!generatedValue) {
      return;
    }
    /** 明确声明需要传入的参数，防难以发现的隐式调用 */
    const mergedValue = mergeFileValue(generatedValue, selfValue, {
      maxSize,
      multiple,
      onError,
    });
    setSelfValue(mergedValue);
    onValueChange?.(mergedValue, e);
    if(!hasFetch) onChange?.(mergedValue);
  }

  const handleControllerUpdate = (updatedItem: FileItemType, finished?: boolean) => {
    setSelfValue(preList => {
      const newList = preList?.map((item) => (
        Object.is(item.file, updatedItem.file) ? updatedItem : item
      ))
      /** 降低更新优先级，置后更新 */
      Promise.resolve().then(() => {
        onValueChange?.(newList);
        if(finished) onChange?.(newList);
      });
      return newList;
    });
  }

  return (
    <div>
      {selfValue?.map((item, index) => (
        <UploadControllerItem
          key={index}
          item={item}
          onUpdate={handleControllerUpdate}
          url={url}
          headers={headers}
          formDataKey={formDataKey}
          fetch={fetch}
        />
      ))}
      {children({
        props,
        list: selfValue,
        onFileChange: handleFileChange,
        onListChange: handleListChange
      })}
    </div>
  )
}
