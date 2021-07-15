declare module 'aligoapi' {
  import aligoapi from 'aligoapi';
  function token(obj: any, auth: any): Promise<any>;
  function alimtalkSend(obj: any, auth: any): Promise<any>;
  export default aligoapi;
}
