import React from 'react';
import UploadButton from "./UploadButton";
import UploadButtonFileList from './UploadButtonFileList';
import UploadController from "./UploadController";
import type { UploadProps } from './types';

export default (props: UploadProps) => (
  <UploadController {...props}>
    {({ props: parentProps, list, onFileChange, onListChange }) => (
      <>
        <UploadButton onChange={onFileChange} multiple={parentProps.multiple}/>
        <UploadButtonFileList list={list} onListChange={onListChange}/>
      </>
    )}
  </UploadController>
);