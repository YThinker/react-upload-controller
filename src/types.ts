import type { CSSProperties, ChangeEvent, ReactNode } from 'react';
import type { ButtonProps } from "antd"

export interface FileItemType {
  progress: number;
  status: 'init' | 'progress' | 'success' | 'fail';
  url: string | null;
  file: File;
}

export interface UploadProps {
  value?: FileItemType[];
  /** 高频更新 */
  onValueChange?: (value?: FileItemType[], e?: ChangeEvent<HTMLInputElement>) => void;
  /** 主要突变更新 */
  onChange?: (value?: FileItemType[]) => void;
  onError?: (error: Error) => void;
  multiple?: boolean | number;
  accept?: string;
  maxSize?: number;
  url?: string;
  headers?: Headers | Record<string, string>;
  formDataKey?: string;
  fetch?: {
    abort?: () => void;
    request: (
      file: Blob,
      onUploadProgress?: (p: number) => void,
    ) => Promise<{
      success: boolean;
      url?: string;
    }>;
  }
}

export interface UploadControllerProps extends UploadProps {
  children: (values: UploadControllerChildrenParams) => ReactNode;
}

export interface UploadControllerChildrenParams {
  props: UploadProps;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onListChange: (list?: FileItemType[]) => void;
  onUpload?: (value: FileItemType[]) => void;
  onError?: (error: Error) => void;
  list?: FileItemType[];
}

/** 上传操作模块 通用类型 */
export interface UploadOperatorProps extends Omit<ButtonProps, 'onChange'> {
  multiple?: UploadProps['multiple'];
  accept?: UploadProps['accept'];
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

export interface UploadControllerItemProps {
  item: FileItemType;
  onUpdate: (item: FileItemType, finished?: boolean) => void;
  url?: UploadProps['url'];
  headers?: UploadProps['headers'];
  formDataKey?: string;
  fetch?: UploadProps['fetch'];
}

/** 上传展示模块 通用类型 */
export interface UploadDisplayProps {
  className?: string;
  style?: CSSProperties;
  list?: FileItemType[];
  onListChange?: (list?: FileItemType[]) => void;
}
