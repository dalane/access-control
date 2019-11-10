export interface IAccessRequest {
  subject:{
    [index:string]:any
  };
  action: {
    [index:string]:any
  };
  resource: {
    [index:string]:any
  };
  environment: {
    [index:string]:any
  };
}