import './index.less';
import React, { useRef } from 'react';
import { Button } from 'antd'
import type { MouseEvent } from 'react';
import type { UploadOperatorProps } from './types';

const UploadButton = (props: UploadOperatorProps) => {
  const {
    children,
    onClick,
    multiple,
    accept,
    onChange,
    ...rest
  } = props;
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = (e: MouseEvent<HTMLAnchorElement>&MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if(inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.click();
    }
  }

  return (
    <Button onClick={handleClick} {...rest}>
      {children ?? '上传文件'}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={!!multiple}
        size={2}
        className='gd-upload-input'
        onChange={onChange}
      />
    </Button>
  )
}

export default UploadButton