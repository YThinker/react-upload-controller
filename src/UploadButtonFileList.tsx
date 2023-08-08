import { CSSTransition, TransitionGroup } from 'react-transition-group';
import CloseIcon from 'gov-digital-pc-lib/icons/CloseIcon';
import { LoadingOutlined } from '@ant-design/icons';
import React from 'react'
import type { UploadDisplayProps } from './types';
import { convertFileTypeToImg } from './utils';


const UploadButtonFileList = (props: UploadDisplayProps) => {
  const { className, style, list, onListChange } = props;

  const handleDelete = (index: number) => {
    onListChange?.(list?.filter((_, i) => i !== index));
  };

  return (
    <TransitionGroup component='ul' className={`gd-upload-button-file-list ${className}`} style={style}>
      {list?.map((fileInfo, index) => (
        <CSSTransition key={index} timeout={200} classNames='gd-upload-button-file-list-item'>
          <li className='gd-upload-button-file-list-item'>
            {convertFileTypeToImg(fileInfo.file.name.split('.').at(-1) ?? '')({
              className: 'gd-upload-icon'
            })}
            <span
              className={`
                gd-upload-button-file-list-name
                ${fileInfo.status === 'fail' ? 'gd-upload-button-file-list-name-fail' : ''}
              `}
            >
              {fileInfo.file.name}
            </span>
            {fileInfo.status === 'progress' && <>
              <LoadingOutlined className='gd-upload-button-file-list-loading'/>
              <span className='gd-upload-button-file-list-percent'>{(fileInfo.progress ?? 0).toFixed(2)}%</span>
            </>}
            <CloseIcon className='gd-upload-button-file-list-delete' onClick={() => handleDelete(index)}/>
          </li>
        </CSSTransition>
      ))}
    </TransitionGroup>
  )
}

export default UploadButtonFileList;
