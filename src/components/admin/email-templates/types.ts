
export type EmailTemplate = {
  id: string;
  name: string;
  description: string;
  getContent: (params: any) => string;
  defaultParams: any;
};
