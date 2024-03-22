export interface IProps {
  title: string;
  isRoot: boolean;
  tabs?: {
    enable: boolean;
    current: string;
    items: any;
    // { name: string, icon: any }
  };
  stepper?: {
    idActive: number;
    titleActive: string;
    items: any;
  };
  customFilter?: {
    enable: boolean;
    inPopover?: boolean;
    // filterParam: { name: string, type: string, input: string, key: string, selectValues: any, valueType: string, value: string }
    filterParam: any;
    hidden?: boolean;
  };
  search?: {
    enable: boolean;
    inPopover?: boolean;
    hidden?: boolean;
  };
  options?: {
    enable: boolean;
    items: any;
    // { func: () => {}, icon: string, color: string }
  };
  popover?: {
    enable: boolean;
    title?: string;
    icon?: string;
    items: any;
    hidden?: boolean;
    // { func: any, text: string, icon: string, toggle: any}
  };
  filter?: {
    enable: any;
    title: string;
    data: any;
    list: any;
    value: string;
    text: string;
    canSearch: boolean;
    onChange: any; //() => {}
    onCancel: any; //() => {}
    inPopover?: boolean;
    hideClear?: boolean;
    hidden?: boolean;
  };
  headerOptions?: {
    buttons?: any;
    // { func: () => {}, icon: string }
  };
  virtualScrollOptions?: {
    disablePullToRefresh?: boolean;
    setState?: any;
  };
  notification?: boolean;
  formOptions?: {
    validations?: {
      required: any;
      min?: any;
      max?: any;
    };
  };
}

export interface ICache {
  key: string;
  group_key: string;
  ttl: number;
}
